const { BrowserWindow, Menu, ipcMain, dialog } = require('electron');

function createMenu(event, template) {
    const menu = Menu.buildFromTemplate(template);
    menu.popup(BrowserWindow.fromWebContents(event.sender));
}

// context menu
ipcMain.on('error', (event, title, conent) => {
    dialog.showErrorBox(title, conent);
});

ipcMain.on('messageBox', (event, text) => {
    event.returnValue = dialog.showMessageBoxSync({
        buttons: ["Yes", "No"],
        message: text
    });
});

// context menu
ipcMain.on('show-context-menu-main', (event) => {
    const template = [
        {
            label: 'Новый бот',
            click: () => { event.sender.send('createBotMenu'); }
        },
        { type: 'separator' },
        {
            label: 'Подключить всех',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        {
            label: 'Отключить всех',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot', (event, id) => {
    const template = [
        {
            label: 'Подключить',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        {
            label: 'Перезагрузить',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        {
            label: 'Отключить',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        { type: 'separator' },
        {
            label: 'Новый бот',
            click: () => { event.sender.send('createBotMenu'); }
        },
        {
            label: 'Создать копию',
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        {
            label: 'Удалить бота',
            click: () => { event.sender.send('deleteBot', id) }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc', (event, id) => {
    const template = [
        {
            label: 'Создать группу',
            click: () => { event.sender.send('createGroup', id) }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc-group', (event, id) => {
    const name = id.split('-')[1] == 'events' ? 'событие': 'комманду';
    const template = [
        {
            label: 'Создать группу',
            click: () => { event.sender.send('createGroup', id) }
        },
        {
            label: `Удалить группу`,
            click: () => { event.sender.send('deleteGroup', id) }
        },
        { type: 'separator' },
        {
            label: `Создать ${name}`,
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc-group-jsfile', (event, id) => {
    const name = id.split('-')[1] == 'events' ? 'событие': 'комманду';
    const commandName = id.split('-')[1] == 'events' ? 'Event': 'Command';
    const template = [
        {
            label: `Создать ${name}`,
            click: () => { event.sender.send(`create${commandName}`, 'menu-item-1') }
        },
        {
            label: `Редактировать ${name}`,
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        {
            label: `Удалить ${name}`,
            click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
        },
        { type: 'separator' },
        {
            label: `Открыть код`,
            click: () => { event.sender.send('openCode', id) }
        },
    ]
    createMenu(event, template)
});