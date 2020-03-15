const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { asyncForEach } = require('../../../utils/general');
const moment = require('moment');

exports.run = async (msg, args) => {
    let hours;

    if (args.length) {
        hours = parseFloat(args[0], 10);
        if (isNaN(hours)) hours = 12;
    } else {
        hours = 12;
    }

    let now = moment();
    let lockTimer = now.add(hours, 'hours');

    await bot.db.set(msg.guild, 'lockTimer', lockTimer);

    await bot.db.set(msg.guild, 'lock', false);
    await send(msg.channel, ':unlock:  |  **Mason Chat is now unlocked**');

    let players = await bot.db.get(msg.guild, 'players');
    if (typeof players === 'undefined') players = [];

    await asyncForEach(players, async uid => {
        const user = bot.client.users.get(uid);
        await send(user, ':unlock:  |  **Mason Chat is now unlocked**');
    });
};

const usage = new Map();
usage.set('', 'Unlock the anonymous channel to messages');
exports.usage = usage;

exports.config = {
    name: 'Unlock channel',
    cmd: 'unlock',
    alias: [],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Unlocks Anonymous Channel',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
