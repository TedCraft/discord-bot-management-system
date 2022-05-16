const { readdirSync } = require('fs');
const { Collection } = require('discord.js');
const path = require("path");

console.log(`Loading events...`);

readdirSync(path.join(__dirname, `../events`)).forEach(dirs => {
    const events = readdirSync(path.join(__dirname, `../events/${dirs}`)).filter(files => files.endsWith('.js'));
    for (const file of events) {
        const event = require(path.join(__dirname, `../events/${dirs}/${file}`));
        console.log(`-> Loaded event ${file.split('.')[0]}`);
        client.on(file.split('.')[0], event.bind(null, client));
        delete require.cache[require.resolve(path.join(__dirname, `../events/${dirs}/${file}`))];
    };
});

console.log(`\nLoading commands...`);

readdirSync(path.join(__dirname, `../commands`)).forEach(dirs => {
    const commands = readdirSync(path.join(__dirname, `../commands/${dirs}`)).filter(files => files.endsWith('.js'));

    for (const file of commands) {
        try {
            const command = require(path.join(__dirname, `../commands/${dirs}/${file}`));
            console.log(`-> Loaded command ${command.data.name.toLowerCase()}`);
            client.commands.set(command.data.name.toLowerCase(), command);
            delete require.cache[require.resolve(path.join(__dirname, `../commands/${dirs}/${file}`))];
        }
        catch (exception) {
            console.log(exception);
        }
    };
});