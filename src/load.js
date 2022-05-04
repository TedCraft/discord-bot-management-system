const { readdirSync, existsSync } = require('fs');
const { BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

ipcMain.on('loadTreeview', (event) => {
    if (!existsSync(path.join(__dirname, 'bots'))) return;

    const json = new Array();;
    readdirSync(path.join(__dirname, 'bots')).forEach(bot => {
        const botId = bot.replace(/ /g, "_");

        json.push({
            text: bot,
            id: botId,
            nodes: [
                {
                    text: "events",
                    id: `${botId}-events`,
                    nodes: []
                },
                {
                    text: "commands",
                    id: `${botId}-commands`,
                    nodes: []
                }
            ]
        });

        readdirSync(path.join(__dirname, `bots/${bot}/events`)).forEach(dir => {
            const eventGroup = dir.replace(/ /g, "-");

            json[json.length - 1].nodes[0].nodes.push({
                text: dir,
                id: `${botId}-events-${eventGroup}`,
                nodes: []
            });

            const events = readdirSync(path.join(__dirname, `bots/${bot}/events/${dir}/`)).filter(files => files.endsWith('.js'));
            for (const file of events) {
                json[json.length - 1].nodes[0].nodes[json[json.length - 1].nodes[0].nodes.length - 1].nodes.push({
                    text: file.slice(0, -3),
                    id: `${botId}-events-${eventGroup}-${file.slice(0, -3)}`
                });
            };
        });

        readdirSync(path.join(__dirname, `bots/${bot}/commands`)).forEach(dir => {
            const eventGroup = dir.replace(/ /g, "-");

            json[json.length - 1].nodes[1].nodes.push({
                text: dir,
                id: `${botId}-commands-${eventGroup}`,
                nodes: []
            });

            const commands = readdirSync(path.join(__dirname, `/bots/${bot}/commands/${dir}/`)).filter(files => files.endsWith('.js'));
            for (const file of commands) {
                json[json.length - 1].nodes[1].nodes[json[json.length - 1].nodes[1].nodes.length - 1].nodes.push({
                    text: file.slice(0, -3),
                    id: `${botId}-commands-${eventGroup}-${file.slice(0, -3)}`
                });
            };
        });
    });

    event.returnValue = json;
});