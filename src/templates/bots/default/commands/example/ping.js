const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    async execute(client = Client.prototype, interaction = CommandInteraction.prototype) {
        //Default parameters here only for intellisence syntax highlighting. You can remove it if neccesary.
        await interaction.reply('Pong!');
    }
};