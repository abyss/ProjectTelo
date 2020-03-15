const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { asyncForEach } = require('../../../utils/general');

exports.run = async (msg) => {
    await bot.db.set(msg.guild, 'lock', true);
    await send(msg.channel, ':lock:  |  **Mason Chat is now locked**');

    let players = await bot.db.get(msg.guild, 'players');
    if (typeof players === 'undefined') players = [];

    await asyncForEach(players, async uid => {
        const user = bot.client.users.get(uid);
        await send(user, ':lock:  |  **Mason Chat is now locked**');
    });
};

const usage = new Map();
usage.set('', 'Lock the Mason Chat to messages');
exports.usage = usage;

exports.config = {
    name: 'Lock channel',
    cmd: 'lock',
    alias: [],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Locks Anonymous Channel',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
