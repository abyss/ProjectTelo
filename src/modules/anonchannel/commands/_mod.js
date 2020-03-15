const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { findUser } = require('../../../utils/discord');
const { randomColor } = require('../../../utils/colors');
const RichEmbed = require('discord.js').RichEmbed;

exports.run = async (msg, args) => {

    let currentMods = await bot.db.get(msg.guild, 'mods');
    if (typeof currentMods === 'undefined') currentMods = [];

    if (args.length < 1) {
        const modMentions = currentMods.map(userid => `<@${userid}>`);
        const output = new RichEmbed()
            .setColor(randomColor())
            .setTitle('Project Telo Mods:')
            .setDescription(modMentions.join('\n'));

        await send(msg.channel, { embed: output });
        return true;
    }

    let output = [];
    args.forEach(userText => {
        const user = findUser(msg.guild, userText);
        const modIndex = currentMods.indexOf(user.id);
        if (modIndex > -1) {
            currentMods.splice(modIndex, 1);
            output.push(`:negative_squared_cross_mark:  |  **${user.user.username}** is no longer a Mod.`);
        } else {
            currentMods.push(user.id);
            output.push(`:white_check_mark:  |  **${user.user.username}** is now a Mod.`);
        }
    });

    await bot.db.set(msg.guild, 'mods', currentMods);
    await send(msg.channel, output.join('\n'));
    return true;
};

const usage = new Map();
usage.set('', 'List current game mods');
usage.set('@user', 'Add/Remove a Game Mod');
exports.usage = usage;

exports.config = {
    name: 'Grant Mod',
    cmd: 'mod',
    alias: [],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Set mods for Anonymous Channel',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
