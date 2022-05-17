const { Client, CommandInteraction } = require('discord.js')

module.exports = async (client = Client.prototype, interaction = CommandInteraction.prototype) => {
    //Default parameters here only for intellisence syntax highlighting. Yuo can remove it if neccesary.
    const cmd = client.commands.get(interaction.commandName);

    if (cmd) {
        if (interaction.isAutocomplete()) {
            await cmd.autoComplete(client, interaction).catch(async (err) => {
                console.log(err);
            });
            return;
        }
        if (!interaction.isCommand()) return;

        await cmd.execute(client, interaction).catch(async (err) => {
            await interaction.reply({ content: "Отказано", ephemeral: true }).catch(ex => { });
            console.log(err);
        });
        return;
    }
};