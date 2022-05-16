const { Client, Intents } = require('discord.js');
const path = require("path");

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    disableMentions: 'everyone',
    fetchAllMembers: true
});

client.config = require('./config');

require(path.join(__dirname, '/src/load'));

client.login(client.config.app.token);