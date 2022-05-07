const { ipcRenderer } = require('electron');
const copydir = require('copy-dir');
const { existsSync, mkdirSync, readdirSync, writeFileSync } = require('fs');
const path = require('path');
const { map } = require('jquery');
const { Http2ServerRequest } = require('http2');
const { resolve } = require('path');

function closeElements(ids) {
    for (const i in ids) {
        const elem = document.getElementById(ids[i]);
        elem.remove();
    }
}

function closeNavTabs(navTabId, navContentId) {
    const elem1 = document.getElementById(navTabId);
    const elem2 = document.getElementById(navContentId);

    const navTab = document.getElementById("nav-tab");
    //const navContent = document.getElementById("nav-tabContent");

    const childTabArray = Array.from(navTab.childNodes);
    const tabIndex = childTabArray.indexOf(elem1);
    elem1.remove();
    elem2.remove();

    if (navTab.childElementCount > 0) {
        const navTabChild = childTabArray[(childTabArray.length - 1 > tabIndex ? tabIndex + 1 : tabIndex - 1)];
        /*navTabChild.classList.add('active');
        navTabChild.ariaSelected = 'true';*/


        const tab = new bootstrap.Tab(navTabChild)
        tab.show()

        /*const childContentArray = Array.from(navContent.childNodes);
        const contentIndex = childContentArray.indexOf(elem2);
        const navContentChild = childContentArray[childContentArray.length - 1 > contentIndex ? contentIndex + 1 : contentIndex - 1];
        navContentChild.classList.add('show');
        navContentChild.classList.add('active');*/
    }
}

function generateTree(json) {
    $('#tree').bstreeview({
        data: json,
        expandIcon: 'fa fa-angle-down fa-fw',
        collapseIcon: 'fa fa-angle-right fa-fw',
        indent: 1.05,
        parentsMarginLeft: '1.05rem',
    });
}

function addToTree(name) {
    const id = name.replace(/ /g, "_")
    const tree = document.getElementById('tree');
    var html =
        `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}" style="padding-left:1.05rem" aria-level="1" id="${id}">
            <i class="state-icon fa fa-angle-right fa-fw"></i>${name}</div>

        <div role="group" class="list-group collapse" id="tree-item-${id}">
            <div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-events" style="padding-left:2.1rem;" aria-level="2" id="${id}-events">
                <i class="state-icon fa fa-angle-right fa-fw"></i>events</div>
            <div role="group" class="list-group collapse" id="tree-item-${id}-events">`;

    readdirSync(path.join(__dirname, `/bots/${name}/events`)).forEach(dir => {
        html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-events-${dir}" style="padding-left:3.1500000000000004rem;" aria-level="3" id="${id}-events-${dir}">
                <i class="state-icon fa fa-angle-right fa-fw"></i>${dir}</div>
            <div role="group" class="list-group collapse" id="tree-item-${id}-events-${dir}">`;

        const events = readdirSync(path.join(__dirname, `/bots/${name}/events/${dir}/`)).filter(files => files.endsWith('.js'));
        for (const file of events) {
            html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-events-${dir}-${file.slice(0, -3)}" style="padding-left:4.2rem;" aria-level="4" id="${id}-events-${dir}-${file.slice(0, -3)}">
                    ${file.slice(0, -3)}</div>`
        };
        html += `</div></div>`;
    });

    html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-commands" style="padding-left:2.1rem;" aria-level="2" id="${id}-commands">
    <i class="state-icon fa fa-angle-right fa-fw"></i>commands</div>
<div role="group" class="list-group collapse" id="tree-item-${id}-commands">`;

    readdirSync(path.join(__dirname, `/bots/${name}/commands`)).forEach(dir => {
        html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-commands-${dir}" style="padding-left:3.1500000000000004rem;" aria-level="3" id="${id}-commands-${dir}">
        <i class="state-icon fa fa-angle-right fa-fw"></i>${dir}</div>
    <div role="group" class="list-group collapse" id="tree-item-${id}-commands-${dir}">`;

        const commands = readdirSync(path.join(__dirname, `/bots/${id}/commands/${dir}/`)).filter(files => files.endsWith('.js'));
        for (const file of commands) {
            html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${id}-commands-${dir}-${file.slice(0, -3)}" style="padding-left:4.2rem;" aria-level="4" id="${id}-commands-${dir}-${file.slice(0, -3)}">
            ${file.slice(0, -3)}</div>`
        };
        html += `</div></div>`;
    });

    html += `</div>`;
    tree.innerHTML += html;
}


function addGroupToTree(name, folder, groupName) {
    const id = groupName.replace(/ /g, "_")
    const treeItem = document.getElementById(`tree-item-${name}-${folder}`);
    var html = `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${name}-${folder}-${id}" style="padding-left:3.1500000000000004rem;" aria-level="3" id="${name}-${folder}-${id}">
                <i class="state-icon fa fa-angle-right fa-fw"></i>${groupName}</div>
            <div role="group" class="list-group collapse" id="tree-item-${name}-${folder}-${id}"></div>`;
    treeItem.innerHTML += html;
}

function createBot(navTabId, navContentId) {
    const name = document.getElementById('inputBotName');
    const token = document.getElementById('inputToken');
    const template = document.getElementById('inputTemplate');
    const from = path.join(__dirname, `/templates/bots/${template.options[template.selectedIndex].value}`);
    const to = path.join(__dirname, `/bots/${name.value}`);
    if (!existsSync(to)) {
        if (token.value === '') {
            ipcRenderer.send('error', `Ошибка!`, `Введите токен бота!`);
            return;
        }
        mkdirSync(to, { recursive: true });
        copydir.sync(from, to, {
            utimes: true,  // keep add time and modify time
            mode: true,    // keep file mode
            cover: true    // cover file when exists, default is true
        });
        addToTree(name.value);
        closeNavTabs(navTabId, navContentId);

        writeFileSync(path.join(__dirname, `/bots/${name.value}/config.js`), `module.exports = {
            app: {
                token: '${token.value}',      // bot token
                activity: ''    // bot activity message (like playing smth)
            }
        };`);
    }
    else {
        ipcRenderer.send('error', `Ошибка!`, `Бот с именем ${name.value} уже существует!`);
    }
}


function createGroup(name, folder, navTabId, navContentId) {
    const botName = document.getElementById(name);
    const folderName = document.getElementById(`${name}-${folder}`);
    const groupName = document.getElementById('inputGroupName');
    const dir = path.join(__dirname, `/bots/${botName.lastChild.textContent}/${folderName.lastChild.textContent}/${groupName.value}`);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        addGroupToTree(name, folder, groupName.value);
        closeNavTabs(navTabId, navContentId);
    }
    else {
        ipcRenderer.send('error', `Ошибка!`, `Группа с именем ${groupName.value} уже существует!`);
    }
}

const json = ipcRenderer.sendSync('loadTreeview');
generateTree(json);