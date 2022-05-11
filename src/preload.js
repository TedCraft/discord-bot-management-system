const { Menu, ipcRenderer, ipcMain, BrowserWindow } = require('electron');
const { rmSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { createNavTab, createModal, createYesNoModal } = require('./functions');
const path = require('path');

const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, '../node_modules/monaco-editor/min'))
});

// workaround monaco-css not understanding the environment
self.module = undefined;

amdRequire(['vs/editor/editor.main'], function () {

    /*monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
    });*/

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: [path.join(__dirname, "../node_modules/@types")]
    });

    const dirs = readdirSync(path.join(__dirname, '../node_modules/@types/node')).filter(files => files.endsWith('.d.ts'));;
    for (let file of dirs) {
        const req = readFileSync(path.join(__dirname, `../node_modules/@types/node/${file}`)).toString();
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            req,
            path.join(__dirname, `../node_modules/@types/node/${file}`)
        );
        //monaco.editor.createModel(req, 'typescript', monaco.Uri.parse(path.join(__dirname, `../node_modules/@types/node/${file}`)));
    }

    const rdirs = readdirSync(path.join(__dirname, '../node_modules'), { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => dir.name);
    for (let dir of rdirs) {
        const files = readdirSync(path.join(__dirname, `../node_modules/${dir}`)).filter(files => files.endsWith('.d.ts'));
        for (let file of files) {
            const req = readFileSync(path.join(__dirname, `../node_modules/${dir}/${file}`)).toString();
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                req,
                path.join(__dirname, `../node_modules/${dir}/${file}`)
            );
            //monaco.editor.createModel(req, 'typescript', monaco.Uri.parse(path.join(__dirname, `../node_modules/@types/node/${file}`)));
        }
    }
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    switch (e.target.className) {
        case "pane pane-main p-3":
        case "app-title":
        case "header":
            ipcRenderer.send('show-context-menu-main');
            break;

        case "list-group-item":
        case "list-group-item collapsed":
            const masId = e.target.id.split('-');
            switch (masId.length) {
                case 1:
                    ipcRenderer.send('show-context-menu-bot', e.target.id);
                    break;
                case 2:
                    ipcRenderer.send('show-context-menu-bot-eorc', e.target.id);
                    break;
                case 3:
                    ipcRenderer.send('show-context-menu-bot-eorc-group', e.target.id);
                    break;
                case 4:
                    switch (e.target.id.split('-')[1]) {
                        case 'events':
                            ipcRenderer.send('show-context-menu-bot-eorc-group-events', e.target.id);
                            break;
                        case 'commands':
                            ipcRenderer.send('show-context-menu-bot-eorc-group-commands', e.target.id);
                            break;
                        default:
                            ipcRenderer.send('show-context-menu-bot-eorc-group-jsfile', e.target.id);
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;

        default:
            break;
    }
});

ipcRenderer.on('createBotMenu', (e) => {
    const menuContent =
        `<form>
            <div class="mb-3">
                <label for="inputBotName" class="form-label">Введите название бота:</label>
                <input type="text" class="form-control" id="inputBotName">
            </div>
            <div class="mb-3">
                <label for="inputToken" class="form-label">Введите токен бота:</label>
                <input type="text" class="form-control" id="inputToken" aria-describedby="inputTokenHelp">
                    <a id="inputTokenHelp" class="form-text" href="https://discord.com/developers/applications" target="_blank">Может быть получен на официальном сайте Discord</a>
            </div>
            <div class="mb-3">
                <label for="inputTemplate" class="form-label">Выберите шаблон:</label>
                <select id="inputTemplate" class="form-select">
                    <option selected>Default</option>
                </select>
            </div>
            <button type="button" class="btn btn-primary" onclick="createBot('nav-create-tab', 'nav-create')">Создать</button>
        </form>`;

    createNavTab("nav-create-tab", "Создание бота", "nav-create", menuContent);
});

ipcRenderer.on('deleteBot', (e, id) => {
    createYesNoModal(`deleteBot('${id}')`, "Внимание!", "Вы действительно хотите удалить бота?");
});

ipcRenderer.on('createGroup', (e, id) => {
    const splitId = id.split('-');
    const name = `${splitId[0]}-${splitId[1]}`;
    const menuContent =
        `<form>
            <div class="mb-3">
                <label for="inputGroupName" class="form-label">Введите название группы:</label>
                <input type="text" class="form-control" id="inputGroupName">
            </div>
        </form>`;

    createModal(menuContent, `createGroup('${splitId[0]}', '${splitId[1]}')`, "Создание группы", "Создать");
});

ipcRenderer.on('deleteGroup', (e, id) => {
    createYesNoModal(`deleteGroup('${id}')`, "Внимание!", "Вы действительно хотите удалить группу?");
});

ipcRenderer.on('openCode', (e, id) => {
    const tab = document.getElementById(`${id}-code-tab`)
    if (!tab) {
        const splitId = id.split('-');
        const botName = document.getElementById(splitId[0]);
        const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
        const group = document.getElementById(`${splitId[0]}-${splitId[1]}-${splitId[2]}`);
        const menuContent =
            `<div class="code-editor" id="${id}-code-editor"></div>`;

        createNavTab(`${id}-code-tab`, `Редактирование ${splitId[splitId.length - 1]}`, `${id}-code`, menuContent);
        const pathFile = path.join(__dirname, `/bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${group.lastChild.textContent}/${splitId[splitId.length - 1]}.js`);
        const file = readFileSync(pathFile);
        if (file) {
            const editor = monaco.editor.create(document.getElementById(`${id}-code-editor`), {
                model: monaco.editor.createModel(file.toString('utf-8'), 'javascript'),
                automaticLayout: true
            });
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
                writeFileSync(pathFile, editor.getValue());
            })
        }
    }
    else {
        const navTab = document.getElementById("nav-tab");
        const existTab = new bootstrap.Tab(navTab.childNodes[Array.from(navTab.childNodes).indexOf(tab)]);
        existTab.show();
    }
});

ipcRenderer.on('createEvent', (e, id) => {
    const events = require('./templates/events').events;
    let html = '';
    let htmlInfo = '';
    for (let event in events) {
        html += `<a class="list-group-item btn rounded-0 list-group-item-action" role="tab" onclick="selectActive(this)">
        <p class="m-0">${event}</p></a>`

        htmlInfo += `
        <a type="button" class="list-group-item btn btn-info rounded-0 justify-content-center" 
        href="https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-${event}" 
        target="_blank">
        info</a>`
    }

    const content =
        `<div class="list-group d-grid d-flex flex-row flex-nowrap col-10 mx-auto">
            <div class="col" id="events--list">
                ${html}
            </div>
            <div class="col-2">
                ${htmlInfo}
            </div>
        </div>`;

    createModal(content, `eventCreate('${id}')`, "Создание ивента", "Создать");
});

ipcRenderer.on('createCommand', (e, id) => {
    const splitId = id.split('-');
    const groupId = `${splitId[0]}-${splitId[1]}-${splitId[2]}`;
    const types = require('./templates/commands').types;
    let htmlTypes = '';
    for (let type of types) {
        htmlTypes += `<option value="${type}">${type}</option>`;
    }

    const menuContent =
        `<form>
            <div class="mb-3">
                <label for="${groupId}-input-command-name" class="form-label">Название команды:</label>
                <input type="text" class="form-control" id="${groupId}-input-command-name">
            </div>
            <div class="mb-3">
                <label for="${groupId}-input-command-description" class="form-label">Описание команды</label>
                <textarea class="form-control" id="${groupId}-input-command-description" rows="2"></textarea>
            </div>
            <div class="mb-3">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="${groupId}-parameters-heading">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${groupId}-parameters-collapse" aria-expanded="true" aria-controls="${groupId}-parameters-collapse">
                            Параметры команды
                        </button>
                    </h2>
                    <div id="${groupId}-parameters-collapse" class="accordion-collapse collapse show" aria-labelledby="${groupId}-parameters-heading">
                        <div class="accordion-body">
                            <div class="table-responsive mb-3">
                                <table class="table table-bordered align-middle">
                                    <thead>
                                        <tr class="text-center">
                                            <th scope="col" class="p-0 border-0"></th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Required</th>
                                            <th scope="col">Parameters</th>
                                        </tr>
                                    </thead>
                                    <tbody id="${groupId}-parameters"></tbody>
                                </table>
                            </div>
                            <label class="form-label">Выберите тип:</label>
                            <div class="input-group">
                                <select class="form-select" id="${groupId}-parameters-select">
                                    ${htmlTypes}
                                </select>
                                <button class="btn btn-outline-primary" onclick="addParameter('${groupId}')" type="button">Добавить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-primary" onclick="createCommand('${groupId}', 'nav-create-command-tab-${groupId}', 'nav-create-command-${groupId}')">Создать</button>
        </form>`

    createNavTab(`nav-create-command-tab-${groupId}`, "Создание команды", `nav-create-command-${groupId}`, menuContent);
});

ipcRenderer.on('deleteEvent', (e, id) => {
    createYesNoModal(`deleteFile('${id}')`, "Внимание!", "Вы действительно хотите удалить событие?");
});

ipcRenderer.on('deleteCommand', (e, id) => {
    createYesNoModal(`deleteFile('${id}')`, "Внимание!", "Вы действительно хотите удалить команду?");
});