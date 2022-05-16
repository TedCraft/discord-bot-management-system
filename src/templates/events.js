module.exports = {
    events: {
        apiRequest: [["request"], ["APIRequest"]],
        apiRespond: [["request", "response"], ["APIRequest", "!Response"]],
        channelCreate: [["channel"], ["GuildChannel"]],
        channelDelete: [["channel"], ["GuildChannel"]],
        channelPinsUpdate: [["channel", "time"], ["TextBasedChannels", "!Date"]],
        channelUpdate: [["oldChannel", "newChannel"], ["GuildChannel", "GuildChannel"]],
        debug: [["info"], "!String"],
        emojiCreate: [["emoji"], ["GuildEmoji"]],
        emojiDelete: [["emoji"], ["GuildEmoji"]],
        emojiUpdate: [["oldEmoji", "newEmoji"], ["GuildEmoji", "GuildEmoji"]],
        error: [["error"], ["!Error"]],
        guildBanAdd: [["ban"], ["GuildBan"]],
        guildBanRemove: [["ban"], ["GuildBan"]],
        guildCreate: [["guild"], ["Guild"]],
        guildDelete: [["guild"], ["Guild"]],
        guildIntegrationsUpdate: [["guild"], ["Guild"]],
        guildMemberAdd: [["member"], ["GuildMember"]],
        guildMemberAvailable: [["member"], ["GuildMember"]],
        guildMemberRemove: [["member"], ["GuildMember"]],
        guildMembersChunk: [["members", "guild", "chunk"], ["Collection", "Guild", "GuildMembersChunk"]],
        guildMemberUpdate: [["oldMember", "newMember"], ["GuildMember", "GuildMember"]],
        guildScheduledEventCreate: [["guildScheduledEvent"], ["GuildScheduledEvent"]],
        guildScheduledEventDelete: [["guildScheduledEvent"], ["GuildScheduledEvent"]],
        guildScheduledEventUpdate: [["oldGuildScheduledEvent", "newGuildScheduledEvent"], ["GuildScheduledEvent", "GuildScheduledEvent"]],
        guildScheduledEventUserAdd: [["guildScheduledEvent", "user"], ["GuildScheduledEvent", "User"]],
        guildScheduledEventUserRemove: [["guildScheduledEvent", "user"], ["GuildScheduledEvent", "User"]],
        guildUnavailable: [["guild"], ["Guild"]],
        guildUpdate: [["oldGuild", "newGuild"], ["Guild", "Guild"]],
        interactionCreate: [["interaction"], ["Interaction"]],
        invalidated: [[], []],
        invalidRequestWarning: [["invalidRequestWarningData"], ["InvalidRequestWarningData"]],
        inviteCreate: [["invite"], ["Invite"]],
        inviteDelete: [["invite"], ["Invite"]],
        messageCreate: [["message"], ["Message"]],
        messageDelete: [["message"], ["Message"]],
        messageDeleteBulk: [["messages"], ["Collection"]],
        messageReactionAdd: [["messageReaction", "user"], ["MessageReaction", "User"]],
        messageReactionRemove: [["messageReaction", "user"], ["MessageReaction", "User"]],
        messageReactionRemoveAll: [["message", "reactions"], ["Message", "Collection"]],
        messageReactionRemoveEmoji: [["reaction"], ["MessageReaction"]],
        messageUpdate: [["oldMessage", "newMessage"], ["Message", "Message"]],
        presenceUpdate: [["oldPresence", "newPresence"], ["Presence", "Presence"]],
        rateLimit: [["rateLimitData"], ["RateLimitData"]],
        ready: [["client"], ["Client"]],
        roleCreate: [["role"], ["Role"]],
        roleDelete: [["role"], ["Role"]],
        roleUpdate: [["oldRole", "newRole"], ["Role", "Role"]],
        shardDisconnect: [["event", "id"], ["!CloseEvent", "!Number"]],
        shardError: [["error", "shardId"], ["!Error", "!Number"]],
        shardReady: [["id", "unavailableGuilds"], ["!Number", "!Set"]],
        shardReconnecting: [["id"], "!Number"],
        shardResume: [["id", "replayedEvents"], ["!Number", "!Number"]],
        stageInstanceCreate: [["stageInstance"], ["StageInstance"]],
        stageInstanceDelete: [["stageInstance"], ["StageInstance"]],
        stageInstanceUpdate: [["oldStageInstance", "newStageInstance"], ["StageInstance", "StageInstance"]],
        stickerCreate: [["sticker"], ["Sticker"]],
        stickerDelete: [["sticker"], ["Sticker"]],
        stickerUpdate: [["oldSticker", "newSticker"], ["Sticker", "Sticker"]],
        threadCreate: [["thread"], ["ThreadChannel", "Boolean"]],
        threadDelete: [["thread"], ["ThreadChannel"]],
        threadListSync: [["threads"], ["Collection"]],
        threadMembersUpdate: [["oldMembers", "newMembers"], ["Collection", "Collection"]],
        threadMemberUpdate: [["oldMember", "newMember"], ["ThreadMember", "ThreadMember"]],
        threadUpdate: [["oldThread", "newThread"], ["ThreadChannel", "ThreadChannel"]],
        typingStart: [["typing"], ["Typing"]],
        userUpdate: [["oldUser", "newUser"], ["User", "User"]],
        voiceStateUpdate: [["oldState", "newState"], ["VoiceState", "VoiceState"]],
        warn: [["info"], ["String"]],
        webhookUpdate: [["channel"], ["TextChannel"]],
    },
    template(params) {
        return `${params.req}\n\nmodule.exports = async (client = Client.prototype${params.args}) => {
    //Default parameters here only for intellisence syntax highlighting. You can remove it if neccesary.
    //For extra information visit https://discord.js.org/#/docs/discord.js/stable/class/Client
    //Put your code below
};`
    },
    getStrings(params) {
        if (params[1].length != 0) {
            const req = `const { Client, ${params[1].filter(el => el.slice(0, 1) != '!').filter((el, idx, arr) => arr.indexOf(el) === idx).join(', ')} } = require('discord.js')`;
            const args = new Array();
            for (let i in params[0]) {
                args.push(`${params[0][i]} = ${params[1][i]}.prototype`)
            }

            return {
                req: req,
                args: `, ${args.join(', ')}`
            }
        }
        else return { req: `const { Client } = require('discord')`, args: '' }
    }
}