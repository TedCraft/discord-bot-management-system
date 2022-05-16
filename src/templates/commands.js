const { closeModal } = require('../functions');

module.exports = {
    types: ["Boolean", "Channel", "Integer", "Mentionable", "Number", "Role", "String", "User", "Subcommand", "SubcommandGroup"],

    Boolean: (elem, groupId) => {
        return `У типа Boolean нет параметров.`;
    },

    getBoolean: (idx, groupId) => {
        closeModal();
    },

    Channel: (elem, groupId) => {
        const types = ["GuildText", "GuildVoice", "GuildCategory", "GuildNews", "GuildStore", "GuildNewsThread", "GuildPublicThread", "GuildPrivateThread", "GuildStageVoice"];
        const setTypes = new Array();
        let checked = false;
        const row = elem.parentElement.parentElement.parentElement.lastChild;
        if (row.textContent != "") {
            const json = JSON.parse(row.textContent).ChannelTypes;
            checked = json.checked;
            setTypes.push(...json.value);
        }
        let html = '';
        for (let type of types) {
            checkedBody = setTypes.includes(type) ? "checked" : "";
            html +=
                `<div class="form-check">` +
                `<input class="form-check-input" type="checkbox" value="" ${checkedBody}>` +
                `<label class="form-check-label">${type}</label>` +
                `</div>`;
        }
        return getContent(groupId, 'channel', 'ChannelType', html, checked);
    },

    getChannel: (idx, groupId) => {
        const channelTypes = new Array();
        const body = document.getElementById('modal-body');
        const checked = body.firstChild.firstChild.firstChild.checked
        const accordion = body.firstChild.lastChild.childNodes;
        for (let child of accordion) {
            if (child.firstChild.checked) {
                channelTypes.push(`"${child.lastChild.textContent}"`);
            }
        }
        const tbody = document.getElementById(`${groupId}-parameters`);
        tbody.childNodes[idx].lastChild.innerHTML = `{ "ChannelTypes": { "checked": ${checked}, "value": [${channelTypes.join(', ')}] } }`;
        closeModal();
    },

    Integer: (elem, groupId) => {
        const row = elem.parentElement.parentElement.parentElement.lastChild;
        let choicesChecked = false;
        let tbody = '';
        let maxChecked = false;
        let maxValue = ''
        let minChecked = false;
        let minValue = '';
        if (row.textContent != "") {
            const json = JSON.parse(row.textContent);
            choicesChecked = json.Choices.checked;
            for (let choice of json.Choices.value) {
                tbody +=
                    `<tr class="text-center">` +
                    `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-danger rounded-0 px-0 border-0" onclick="removeTableElem(this)">X</button></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[0]}"></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[1]}"></div></td>` +
                    `</tr>`;
            }
            maxChecked = json.MaxValue.checked;
            maxValue = json.MaxValue.value;
            minChecked = json.MinValue.checked;
            minValue = json.MinValue.value;
        }
        let html = '';
        const choicesHtml =
            `<div class="table-responsive mb-3">` +
            `<table class="table table-bordered align-middle">` +
            `<thead>` +
            `<tr class="text-center p-0">` +
            `<th scope="col" class="p-0 border-0"></th>` +
            `<th scope="col">name</th>` +
            `<th scope="col">value</th>` +
            `</tr>` +
            `</thead>` +
            `<tbody id="${groupId}-parameters-modal">${tbody}</tbody>` +
            `</table>` +
            `</div>` +
            `<button class="btn btn-outline-primary" onclick="addParameterModal('${groupId}')" type="button">Добавить</button>`;
        html += getContent(groupId, 'integer', 'Choices', choicesHtml, choicesChecked);
        html += getContent(groupId, 'integer', 'MaxValue', `<input type="text" class="form-control" id="MaxValue" value="${maxValue}">`, maxChecked);
        html += getContent(groupId, 'integer', 'MinValue', `<input type="text" class="form-control" id="MinValue" value="${minValue}">`, minChecked);
        return html;
    },

    getInteger: (idx, groupId) => {
        const body = document.getElementById('modal-body');
        content = new Array();
        for (let elem of body.childNodes) {
            const checked = elem.firstChild.firstChild.checked;
            const accordion = elem.lastChild.firstChild;
            if (accordion.classList.contains('table-responsive')) {
                const choicesArr = new Array();
                const aTBody = document.getElementById(`${groupId}-parameters-modal`);
                for (let row of aTBody.childNodes) {
                    const choice = new Array();
                    choice.push(`"${row.childNodes[1].firstChild.firstChild.value}"`);
                    choice.push(row.childNodes[2].firstChild.firstChild.value);
                    choicesArr.push(`[${choice.join(', ')}]`)
                }
                content.push(`"Choices": { "checked": ${checked}, "value": [${choicesArr.join(', ')}] }`);
            }
            else {
                content.push(`"${accordion.id}": { "checked": ${checked}, "value": "${accordion.value}" }`)
            }
        }
        const tbody = document.getElementById(`${groupId}-parameters`);
        tbody.childNodes[idx].lastChild.innerHTML = `{ ${content.join(', ')} }`;
        closeModal();
    },

    Mentionable: (elem, groupId) => {
        return `У типа Mentionable нет параметров.`;
    },

    getMentionable: (idx, groupId) => {
        closeModal();
    },

    Number: (elem, groupId) => {
        const row = elem.parentElement.parentElement.parentElement.lastChild;
        let choicesChecked = false;
        let tbody = '';
        let maxChecked = false;
        let maxValue = ''
        let minChecked = false;
        let minValue = '';
        if (row.textContent != "") {
            const json = JSON.parse(row.textContent);
            choicesChecked = json.Choices.checked;
            for (let choice of json.Choices.value) {
                tbody +=
                    `<tr class="text-center">` +
                    `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-danger rounded-0 px-0 border-0" onclick="removeTableElem(this)">X</button></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[0]}"></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[1]}"></div></td>` +
                    `</tr>`;
            }
            maxChecked = json.MaxValue.checked;
            maxValue = json.MaxValue.value;
            minChecked = json.MinValue.checked;
            minValue = json.MinValue.value;
        }
        let html = '';
        const choicesHtml =
            `<div class="table-responsive mb-3">` +
            `<table class="table table-bordered align-middle">` +
            `<thead>` +
            `<tr class="text-center p-0">` +
            `<th scope="col" class="p-0 border-0"></th>` +
            `<th scope="col">name</th>` +
            `<th scope="col">value</th>` +
            `</tr>` +
            `</thead>` +
            `<tbody id="${groupId}-parameters-modal">${tbody}</tbody>` +
            `</table>` +
            `</div>` +
            `<button class="btn btn-outline-primary" onclick="addParameterModal('${groupId}')" type="button">Добавить</button>`;
        html += getContent(groupId, 'integer', 'Choices', choicesHtml, choicesChecked);
        html += getContent(groupId, 'integer', 'MaxValue', `<input type="text" class="form-control" id="MaxValue" value="${maxValue}">`, maxChecked);
        html += getContent(groupId, 'integer', 'MinValue', `<input type="text" class="form-control" id="MinValue" value="${minValue}">`, minChecked);
        return html;
    },

    getNumber(idx, groupId) {
        const body = document.getElementById('modal-body');
        content = new Array();
        for (let elem of body.childNodes) {
            const checked = elem.firstChild.firstChild.checked;
            const accordion = elem.lastChild.firstChild;
            if (accordion.classList.contains('table-responsive')) {
                const choicesArr = new Array();
                const aTBody = document.getElementById(`${groupId}-parameters-modal`);
                for (let row of aTBody.childNodes) {
                    const choice = new Array();
                    choice.push(`"${row.childNodes[1].firstChild.firstChild.value}"`);
                    choice.push(row.childNodes[2].firstChild.firstChild.value);
                    choicesArr.push(`[${choice.join(', ')}]`)
                }
                content.push(`"Choices": { "checked": ${checked}, "value": [${choicesArr.join(', ')}] }`);
            }
            else {
                content.push(`"${accordion.id}": { "checked": ${checked}, "value": "${accordion.value}" }`)
            }
        }
        const tbody = document.getElementById(`${groupId}-parameters`);
        tbody.childNodes[idx].lastChild.innerHTML = `{ ${content.join(', ')} }`;
        closeModal();
    },

    Role: (elem, groupId) => {
        return `У типа Role нет параметров.`;
    },

    getRole: (idx, groupId) => {
        closeModal();
    },

    String: (elem, groupId) => {
        const row = elem.parentElement.parentElement.parentElement.lastChild;
        let choicesChecked = false;
        let tbody = '';
        if (row.textContent != "") {
            const json = JSON.parse(row.textContent);
            choicesChecked = json.Choices.checked;
            for (let choice of json.Choices.value) {
                tbody +=
                    `<tr class="text-center">` +
                    `<td class="p-0 border-0"><div class="d-grid gap-1"><button type="button" class="btn btn-danger rounded-0 px-0 border-0" onclick="removeTableElem(this)">X</button></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[0]}"></div></td>` +
                    `<td><div class="d-grid gap-1"><input type="email" class="form-control rounded-0 px-0 border-0" value="${choice[1]}"></div></td>` +
                    `</tr>`;
            }
        }
        const choicesHtml =
            `<div class="table-responsive mb-3">` +
            `<table class="table table-bordered align-middle">` +
            `<thead>` +
            `<tr class="text-center p-0">` +
            `<th scope="col" class="p-0 border-0"></th>` +
            `<th scope="col">name</th>` +
            `<th scope="col">value</th>` +
            `</tr>` +
            `</thead>` +
            `<tbody id="${groupId}-parameters-modal">${tbody}</tbody>` +
            `</table>` +
            `</div>` +
            `<button class="btn btn-outline-primary" onclick="addParameterModal('${groupId}')" type="button">Добавить</button>`;
        return getContent(groupId, 'integer', 'Choices', choicesHtml, choicesChecked);;
    },

    getString(idx, groupId) {
        const body = document.getElementById('modal-body');
        content = new Array();
        for (let elem of body.childNodes) {
            const checked = elem.firstChild.firstChild.checked;
            const choicesArr = new Array();
            const aTBody = document.getElementById(`${groupId}-parameters-modal`);
            for (let row of aTBody.childNodes) {
                const choice = new Array();
                for (let col of row.childNodes) {
                    if (!col.classList.contains('p-0')) {
                        choice.push(`"${col.firstChild.firstChild.value}"`)
                    }
                }
                choicesArr.push(`[${choice.join(', ')}]`)
            }
            content.push(`"Choices": { "checked": ${checked}, "value": [${choicesArr.join(', ')}] }`);
        }
        const tbody = document.getElementById(`${groupId}-parameters`);
        tbody.childNodes[idx].lastChild.innerHTML = `{ ${content.join(', ')} }`;
        closeModal();
    },

    User: (elem, groupId) => {
        return `У типа User нет параметров.`;
    },

    getUser: (idx, groupId) => {
        closeModal();
    },
    
    setChannelTypes: (json, content) => {
        return json.addType("ChannelTypes", `${JSON.stringify(content)}`);
    },
    
    setChoices: (json, content) => {
        return json.addType("Choices", `${JSON.stringify(content)}`);
    },
    
    setMaxValue: (json, content) => {
        return json.set("MaxValue", `${content}`);
    },
    
    setMinValue: (json, content) => {
        return json.set("MinValue", `${content}`);
    },

    template(top, bot) {
        return `const { SlashCommandBuilder } = require('@discordjs/builders');\nconst { Client, CommandInteraction } = require('discord.js');\n\nmodule.exports = {\ndata: new SlashCommandBuilder()\n${top.slice(0, -1)},\n\nasync execute(client = Client.prototype, interaction = CommandInteraction.prototype) {\n//Default parameters here only for intellisence syntax highlighting. You can remove it if neccesary.\n//put your code here\n${bot}}\n};`;
    },
    set(commandName, commandContent) {
        return `.set${commandName}(${commandContent})\n`;
    },
    add(commandType, commandOption) {
        return `.add${commandType}Option(option =>\noption${commandOption.slice(0, -1)})\n`;
    },
    addType(commandType, commandContent) {
        return `.add${commandType}(${commandContent})\n`;
    },
    get(commandType, name) {
        return `const ${name} = interaction.options.get${commandType}('${name}');\n`;
    },
}
function getContent(groupId, type, name, content, checked = false) {
    return `<div class="accordion-item mb-3">` +
        `<div class="form-check">` +
        `<input class="form-check-input" type="checkbox" value="" id="checkbox-${name}" ${checked ? "checked" : ""}>` +
        `<label class="form-check-label" for="checkbox-${name}">Включено</label>` +
        `</div>` +
        `<h2 class="accordion-header" id="${groupId}-parameters-heading-${type}-${name}">` +
        `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${groupId}-parameters-collapse-${type}-${name}" aria-expanded="false" aria-controls="${groupId}-parameters-collapse-${type}-${name}">` +
        `${name}` +
        `</button>` +
        `</h2>` +
        `<div id="${groupId}-parameters-collapse-${type}-${name}" class="accordion-collapse collapse" aria-labelledby="${groupId}-parameters-heading-${type}-${name}">` +
        `${content}` +
        `</div>` +
        `</div>`;
}