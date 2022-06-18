const { ipcRenderer, ipcMain } = require('electron');
const copydir = require('copy-dir');
const { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } = require('fs');
const path = require('path');
const { createModal, closeModal } = require('./functions');

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
            html += `<div role="treeitem" class="list-group-item" style="padding-left:4.2rem;" aria-level="4" id="${id}-events-${dir}-${file.slice(0, -3)}">${file}</div>`
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

        const commands = readdirSync(path.join(__dirname, `/bots/${name}/commands/${dir}/`)).filter(files => files.endsWith('.js'));
        for (const file of commands) {
            html += `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" style="padding-left:4.2rem;" aria-level="4" id="${id}-commands-${dir}-${file.slice(0, -3)}">${file}</div>`
        };
        html += `</div></div>`;
    });

    html += `</div>`;
    tree.innerHTML += html;
    tree.normalize();
}


function addGroupToTree(name, folder, groupName) {
    const id = groupName.replace(/ /g, "_")
    const treeItem = document.getElementById(`tree-item-${name}-${folder}`);
    var html = `<div role="treeitem" class="list-group-item" data-bs-toggle="collapse" data-bs-target="#tree-item-${name}-${folder}-${id}" style="padding-left:3.1500000000000004rem;" aria-level="3" id="${name}-${folder}-${id}">
                <i class="state-icon fa fa-angle-right fa-fw"></i>${groupName}</div>
            <div role="group" class="list-group collapse" id="tree-item-${name}-${folder}-${id}"></div>`;
    treeItem.innerHTML += html;
    treeItem.normalize();
}

function addFileToTree(botName, folder, groupName, name) {
    const treeItem = document.getElementById(`tree-item-${botName}-${folder}-${groupName}`);
    var html = `<div role="treeitem" class="list-group-item" style="padding-left:4.2rem;" aria-level="3" id="${botName}-${folder}-${groupName}-${name.slice(0, -3)}">${name}</div>`
    treeItem.innerHTML += html;
    treeItem.normalize();
}

function createBot(navTabId, navContentId) {
    const name = document.getElementById('inputBotName');
    if (name.value === '') {
        ipcRenderer.send('error', `Ошибка!`, `Введите название бота!`);
        return;
    }
    const token = document.getElementById('inputToken');
    if (token.value === '') {
        ipcRenderer.send('error', `Ошибка!`, `Введите токен бота!`);
        return;
    }
    const template = document.getElementById('inputTemplate');
    const from = path.join(__dirname, `/templates/bots/${template.value}`);
    const to = path.join(__dirname, `/bots/${name.value}`);
    if (!existsSync(to)) {
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


function createGroup(name, folder) {
    const botName = document.getElementById(name);
    const folderName = document.getElementById(`${name}-${folder}`);
    const groupName = document.getElementById('inputGroupName');
    if (groupName.value === '') {
        ipcRenderer.send('error', `Ошибка!`, `Введите название подгруппы!`);
        return;
    }
    const dir = path.join(__dirname, `/bots/${botName.lastChild.textContent}/${folderName.lastChild.textContent}/${groupName.value}`);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        addGroupToTree(name, folder, groupName.value);
        closeModal();
    }
    else {
        ipcRenderer.send('error', `Ошибка!`, `Подгруппа с именем ${groupName.value} уже существует!`);
    }
}

function deleteBot(id) {
    const name = document.getElementById(id);
    const group = document.getElementById(`tree-item-${id}`);
    rmSync(path.join(__dirname, `bots/${name.lastChild.textContent}`), { recursive: true });
    const tree = document.getElementById('tree');
    tree.removeChild(name);
    tree.removeChild(group);
    closeModal();
}

function deleteGroup(id) {
    const splitId = id.split('-');
    const groupId = `${splitId[0]}-${splitId[1]}-${splitId[2]}`;
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const name = document.getElementById(groupId);
    //const group = document.getElementById(`tree-item-${groupId}`);

    const dir = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${name.lastChild.textContent}`);
    if (readdirSync(dir).length != 0) {
        ipcRenderer.send('error', `Ошибка!`, `Подгруппа с именем ${name.lastChild.textContent} не пустая!`);
        return;
    }

    rmSync(dir, { recursive: true });
    //const tree = document.getElementById('tree');
    name.remove();
    //name.remove();

    closeModal();
}

function selectActive(elem) {
    if (!elem.classList.contains("active")) {
        const activeElem = document.getElementById("events--list").getElementsByClassName("active");
        if (activeElem.length != 0) {
            for (let aElem of activeElem)
                aElem.classList.remove("active");
        }
        elem.classList.add("active");
    }
}

function eventCreate(id) {
    const activeElem = document.getElementById("events--list").getElementsByClassName("active");
    if (activeElem.length == 0) {
        ipcRenderer.send('error', `Ошибка!`, `Выберите событие!`);
        return;
    }

    const splitId = id.split('-');
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const name = document.getElementById(`${splitId[0]}-${splitId[1]}-${splitId[2]}`);

    const pathToParentDir = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}`);
    const pathToFile = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${name.lastChild.textContent}/${activeElem[0].lastChild.textContent}.js`);

    const dirs = readdirSync(pathToParentDir)
    for (let dir of dirs) {
        const files = readdirSync(`${pathToParentDir}/${dir}`).filter(files => files.endsWith('.js'));
        for (const file of files) {
            if (file.slice(0, -3) == activeElem[0].lastChild.textContent) {
                ipcRenderer.send('error', `Ошибка!`, `Событие ${file.slice(0, -3)} уже существует!`);
                return;
            }
        }
    }
    const eventTemplate = require('./templates/events');
    writeFileSync(pathToFile, `${eventTemplate.template(eventTemplate.getStrings(eventTemplate.events[activeElem[0].lastChild.textContent]))}`);
    addFileToTree(splitId[0], splitId[1], splitId[2], `${activeElem[0].lastChild.textContent}.js`);
    closeModal();
}

function addParameter(groupId) {
    const content =
        `<form>
            <div class="mb-3">
                <label for="${groupId}-input-parameter-name" class="form-label">Название опции:</label>
                <input type="text" class="form-control" id="${groupId}-input-parameter-name">
            </div>
            <div class="mb-3">
                <label for="${groupId}-input-parameter-description" class="form-label">Описание опции</label>
                <textarea class="form-control" id="${groupId}-input-parameter-description" rows="2"></textarea>
            </div>
        </form>`;
    createModal(content, `addCommandParameter('${groupId}')`, 'Добавление опции', 'Добавить');
}

function addParameterModal(groupId) {
    const elem = document.createElement('tr');
    elem.classList.add('text-center');
    elem.classList.add('p-0');
    elem.innerHTML =
        `<tr class="text-center">` +
        `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-danger rounded-0 px-0 border-0" onclick="removeTableElem(this)">X</button></div></td>` +
        `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0"></div></td>` +
        `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0"></div></td>` +
        `</tr>`;
    elem.normalize();

    document.getElementById(`${groupId}-parameters-modal`).appendChild(elem);
}

function addCommandParameter(groupId) {
    const name = document.getElementById(`${groupId}-input-parameter-name`);
    if (name.value === "") return ipcRenderer.send('error', `Ошибка!`, `Команда введите название команды!`);
    if (!/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(name.value)) return ipcRenderer.send('error', `Ошибка!`, `Название команды в неверном формате!`);
    const description = document.getElementById(`${groupId}-input-parameter-description`);
    if (name.value === "") return ipcRenderer.send('error', `Ошибка!`, `Команда введите описание команды!`);

    const select = document.getElementById(`${groupId}-parameters-select`);

    const html =
        `<tr class="text-center">` +
        `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-danger rounded-0 px-0 border-0" onclick="removeTableElem(this)">X</button></div></td>` +
        `<td>${select.value}</td>` +
        `<td>${name.value}</td>` +
        `<td>${description.value}</td>` +
        `<td><input class="form-check-input" type="checkbox" value="" checked></td>` +
        `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-primary rounded-0 px-0 border-0" onclick="openParameters(this, '${groupId}', '${select.value}')">Open</button></div></td>` +
        `<td hidden="true"></td>` +
        `</tr>`;

    const parameters = document.getElementById(`${groupId}-parameters`);
    parameters.innerHTML += html;
    parameters.normalize();
    closeModal();
}

function openParameters(elem, groupId, type) {
    const commands = require('./templates/commands');
    const nodes = elem.parentElement.parentElement.parentElement.parentElement.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].isSameNode(elem.parentElement.parentElement.parentElement)) {
            break;
        }
    }
    createModal(commands[type](elem, groupId), `acceptParameters('${i}', '${groupId}', '${type}')`, 'Параметры', 'OK');
}

function acceptParameters(elem, groupId, type) {
    const commands = require('./templates/commands');
    commands[`get${type}`](elem, groupId);
}

function removeTableElem(elem) {
    elem.parentElement.parentElement.parentElement.remove();
}

function createCommand(groupId, navTabId, navContentId) {
    const name = document.getElementById(`${groupId}-input-command-name`);
    if (name.value === "") return ipcRenderer.send('error', `Ошибка!`, `Команда введите название команды!`);
    if (!/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(name.value)) return ipcRenderer.send('error', `Ошибка!`, `Название команды в неверном формате!`);
    const description = document.getElementById(`${groupId}-input-command-description`);
    if (name.value === "") return ipcRenderer.send('error', `Ошибка!`, `Команда введите описание команды!`);

    const splitId = groupId.split('-');
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const folderName = document.getElementById(groupId);

    const pathToParentDir = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}`);
    const pathToFile = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${folderName.lastChild.textContent}/${name.value}.js`);

    const dirs = readdirSync(pathToParentDir)
    for (let dir of dirs) {
        const files = readdirSync(`${pathToParentDir}/${dir}`).filter(files => files.endsWith('.js'));
        for (const file of files) {
            if (file.slice(0, -3) == name.value) return ipcRenderer.send('error', `Ошибка!`, `Команда ${file.slice(0, -3)} уже существует!`);
        }
    }

    const cTemplate = require('./templates/commands');
    let optionsTop = `${cTemplate.set('Name', `'${name.value}'`)}${cTemplate.set('Description', `'${description.value}'`)}`;
    let optionsBot = '';

    const tbody = document.getElementById(`${groupId}-parameters`);
    for (let row of tbody.childNodes) {
        const cType = row.childNodes[1].textContent;
        const cName = row.childNodes[2].textContent;
        const cDescription = row.childNodes[3].textContent;
        const cRequired = row.childNodes[4].lastChild.checked;
        let cParameters = '';
        if (row.lastChild.textContent != "") {
            const json = JSON.parse(row.lastChild.textContent);
            for (let type in json) {
                if (json[type].checked) {
                    cParameters += cTemplate[`set${type}`](cTemplate, json[type].value);
                }
            }
            console.log(cParameters);
        }

        const commandOptions = `${cTemplate.set('Name', `'${cName}'`)}${cTemplate.set('Description', `'${cDescription}'`)}${cTemplate.set('Required', cRequired)}${cParameters}`
        optionsTop += cTemplate.add(cType, commandOptions)
        optionsBot += cTemplate.get(cType, cName)
    }

    writeFileSync(pathToFile, cTemplate.template(optionsTop, optionsBot));
    addFileToTree(splitId[0], splitId[1], splitId[2], `${name.value}.js`);
    closeNavTabs(navTabId, navContentId);
}

function deleteFile(id) {
    const splitId = id.split('-');
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const folderName = document.getElementById(`${splitId[0]}-${splitId[1]}-${splitId[2]}`);
    const name = document.getElementById(`${id}`);
    //const group = document.getElementById(`tree-item-${groupId}`);

    const file = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${folderName.lastChild.textContent}/${name.lastChild.textContent}`);

    rmSync(file, { recursive: true });
    //const tree = document.getElementById('tree');
    name.remove();

    closeModal();
}

const json = ipcRenderer.sendSync('loadTreeview');
generateTree(json);