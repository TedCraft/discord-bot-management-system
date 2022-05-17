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
            click: () => { event.sender.send('connectAll'); }
        },
        {
            label: 'Отключить всех',
            click: () => { event.sender.send('disconnectAll') }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot', (event, id) => {
    const template = [
        {
            label: 'Подключить',
            click: () => { event.sender.send('connectBot', id) }
        },
        {
            label: 'Перезагрузить',
            click: () => { event.sender.send('refreshBot', id) }
        },
        {
            label: 'Отключить',
            click: () => { event.sender.send('disconnectBot', id) }
        },
        { type: 'separator' },
        {
            label: 'Открыть логи',
            click: () => { event.sender.send('openLogs', id) }
        },
        { type: 'separator' },
        {
            label: 'Новый бот',
            click: () => { event.sender.send('createBotMenu'); }
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
            label: 'Создать подгруппу',
            click: () => { event.sender.send('createGroup', id) }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc-group', (event, id) => {
    const name = id.split('-')[1] == 'events' ? 'событие' : 'команду';
    const commandName = id.split('-')[1] == 'events' ? 'Event' : 'Command';
    const template = [
        {
            label: `Создать ${name}`,
            click: () => { event.sender.send(`create${commandName}`, id) }
        },
        { type: 'separator' },
        {
            label: 'Создать подгруппу',
            click: () => { event.sender.send('createGroup', id) }
        },
        {
            label: `Удалить подгруппу`,
            click: () => { event.sender.send('deleteGroup', id) }
        },
    ]
    createMenu(event, template)
});


// context menu
ipcMain.on('show-context-menu-bot-eorc-group-events', (event, id) => {
    const name = id.split('-')[1] == 'events' ? 'событие' : 'команду';
    const commandName = id.split('-')[1] == 'events' ? 'Event' : 'Command';
    const template = [
        {
            label: `Создать событие`,
            click: () => { event.sender.send(`createEvent`, id) }
        },
        {
            label: `Удалить событие`,
            click: () => { event.sender.send('deleteEvent', id) }
        },
        { type: 'separator' },
        {
            label: `Открыть код`,
            click: () => { event.sender.send('openCode', id) }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc-group-commands', (event, id) => {
    const template = [
        {
            label: `Создать команду`,
            click: () => { event.sender.send(`createCommand`, id) }
        },
        {
            label: `Удалить команду`,
            click: () => { event.sender.send(`deleteCommand`, id) }
        },
        { type: 'separator' },
        {
            label: `Открыть код`,
            click: () => { event.sender.send('openCode', id) }
        },
    ]
    createMenu(event, template)
});

// context menu
ipcMain.on('show-context-menu-bot-eorc-group-jsfile', (event, id) => {
    const template = [
        {
            label: `Создать файл`,
            click: () => { event.sender.send(`createFile`, id) }
        },
        {
            label: `Удалить файл`,
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