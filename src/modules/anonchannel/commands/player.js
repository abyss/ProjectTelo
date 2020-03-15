const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { findUser } = require('../../../utils/discord');
const { randomColor } = require('../../../utils/colors');
const RichEmbed = require('discord.js').RichEmbed;

exports.run = async (msg, args) => {

    let currentPlayers = await bot.db.get(msg.guild, 'players');
    if (typeof currentPlayers === 'undefined') currentPlayers = [];

    if (args.length < 1) {
        const playerMentions = currentPlayers.map(userid => `<@${userid}>`);
        const output = new RichEmbed()
            .setColor(randomColor())
            .setTitle('Project Telo Players:')
            .setDescription(playerMentions.join('\n'));

        await send(msg.channel, { embed: output });
        return true;
    }

    let output = [];
    args.forEach(userText => {
        const user = findUser(msg.guild, userText);
        const modIndex = currentPlayers.indexOf(user.id);
        if (modIndex > -1) {
            currentPlayers.splice(modIndex, 1);
            output.push(`:negative_squared_cross_mark:  |  **${user.user.username}** is no longer a Player.`);
        } else {
            currentPlayers.push(user.id);
            output.push(`:white_check_mark:  |  **${user.user.username}** is now a Player.`);
        }
    });

    await bot.db.set(msg.guild, 'players', currentPlayers);
    await send(msg.channel, output.join('\n'));
    return true;
};

const usage = new Map();
usage.set('', 'List current game players');
usage.set('@user', 'Add/Remove a Player');
exports.usage = usage;

exports.config = {
    name: 'Set Players',
    cmd: 'player',
    alias: [],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Set players for Anonymous Channel',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
