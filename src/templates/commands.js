module.exports = {
    types: ["Boolean", "Channel", "Integer", "Mentionable", "Number", "Role", "String", "User", "Subcommand", "SubcommandGroup"],
    options: {
        boolean: [],

    },
    template(top, bot) {
        return `const { SlashCommandBuilder } = require('@discordjs/builders');\n\nmodule.exports = {\ndata: new SlashCommandBuilder()\n${top.slice(0,-1)},\n\nasync execute(client, interaction) {\n//put your code here\n${bot}}\n};`;
    },
    set(commandName, commandContent) {
        return `.set${commandName}(${commandContent})\n`;
    },
    add(commandType, commandOption) {
        return `.add${commandType}Option(option =>\noption${commandOption.slice(0,-1)})\n`;
    },
    get(commandType, name) {
        return `const ${name} = interaction.options.get${commandType}('${name}')\n`;
    }
}