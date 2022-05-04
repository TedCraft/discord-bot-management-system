//const { connectToDatabase } = require('../../src/database/database');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

module.exports = async (client) => {
    console.log(`\nLogged to the client ${client.user.username}\n-> Ready on ${client.guilds.cache.size} servers for a total of ${client.users.cache.size} users`);
    client.user.setActivity(client.config.app.activity);

    //console.log(`\nCheck database...`);
    //client.db = await connectToDatabase(client);
    //await checkDatabase(client);
    //console.log(`Database check successful!`);

    const rest = new REST({ version: '9' }).setToken(client.config.app.token);
    await (async () => {
        try {
            console.log('\nStarted refreshing application (/) commands.');
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.commands.map(item => item.data.toJSON()) },
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
};