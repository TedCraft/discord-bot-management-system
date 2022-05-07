const { Menu, ipcRenderer, ipcMain, BrowserWindow } = require('electron');
const { rmSync, readdirSync, readFileSync, writeFileSync } = require('fs');
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

amdRequire(['vs/editor/editor.main'], function () { });

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
          ipcRenderer.send('show-context-menu-bot-eorc-group-jsfile', e.target.id);
          break;
        default:
          break;
      }
      break;

    default:
      break;
  }
});

function createNavTab(navTabId, navTabName, navMenuId, navMenuContent) {
  if (!document.getElementById(navTabId)) {
    const navTab = document.getElementById("nav-tab");
    navTab.innerHTML +=
      `<a class="nav-link" id="${navTabId}" data-bs-toggle="tab" data-bs-target="#${navMenuId}" type="button"
      role="tab" aria-controls="${navMenuId}" aria-selected="false">${navTabName}
      <button type="button" class="btn-close" aria-label="Close" onclick="closeNavTabs('${navTabId}', '${navMenuId}')"></button></a>`;

    const navContent = document.getElementById("nav-tabContent");
    const contentElem = document.createElement('div');
    contentElem.classList.add('tab-pane');
    contentElem.id = `${navMenuId}`;
    contentElem.setAttribute('role', 'tabpanel');
    contentElem.setAttribute('aria-labelledby', '${navTabId}');
    contentElem.innerHTML +=
      `<div class="p-3">
          ${navMenuContent}
        </div>`;
    navContent.appendChild(contentElem);

    const tab = new bootstrap.Tab(navTab.lastChild)
    tab.show()
  }
}

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
  if (ipcRenderer.sendSync('messageBox', "Вы действительно хотите удалить бота?") === 0) {
    const name = document.getElementById(id);
    const group = document.getElementById(`tree-item-${id}`);
    rmSync(path.join(__dirname, `bots/${name.lastChild.textContent}`), { recursive: true });
    const tree = document.getElementById('tree');
    tree.removeChild(name);
    tree.removeChild(group);
  }
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
<button type="button" class="btn btn-primary" onclick="createGroup('${splitId[0]}', '${splitId[1]}', 'nav-create-group-${name}-tab', 'nav-create-group-${name}')">Создать</button>
</form>`;

  createNavTab(`nav-create-group-${name}-tab`, "Создание группы", `nav-create-group-${name}`, menuContent);
});

ipcRenderer.on('deleteGroup', (e, id) => {
  if (ipcRenderer.sendSync('messageBox', "Вы действительно хотите удалить группу?") === 0) {
    const splitId = id.split('-');
    const groupId = `${splitId[0]}-${splitId[1]}-${splitId[2]}`;
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const name = document.getElementById(groupId);
    const group = document.getElementById(`tree-item-${groupId}`);

    const dir = path.join(__dirname, `bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${name.lastChild.textContent}`);
    if (readdirSync(dir).length != 0) {
      ipcRenderer.send('error', `Ошибка!`, `Группа с именем ${name.lastChild.textContent} не пустая!`);
      return;
    }

    rmSync(dir, { recursive: true });
    //const tree = document.getElementById('tree');
    name.remove();
    name.remove();
  }
});

ipcRenderer.on('openCode', (e, id) => {
  const tab = document.getElementById(`${id}-code-tab`)
  if (!tab) {
    const splitId = id.split('-');
    const botName = document.getElementById(splitId[0]);
    const groupName = document.getElementById(`${splitId[0]}-${splitId[1]}`);
    const group = document.getElementById(`${splitId[0]}-${splitId[1]}-${splitId[2]}`);
    const name = document.getElementById(`${id}`);
    const menuContent =
      `<div class="code-editor" id="${id}-code-editor"></div>`;

    createNavTab(`${id}-code-tab`, `Редактирование ${splitId[splitId.length - 1]}`, `${id}-code`, menuContent);
    const pathFile = path.join(__dirname, `/bots/${botName.lastChild.textContent}/${groupName.lastChild.textContent}/${group.lastChild.textContent}/${name.lastChild.textContent}.js`);
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