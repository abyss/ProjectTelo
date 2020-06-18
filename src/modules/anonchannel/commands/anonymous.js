const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { parseBoolean } = require('../../../utils/general');

exports.run = async (msg, args) => {
    let result;
    if (args.length) {
        result = parseBoolean(args.join(' '));
        await bot.db.set(msg.guild, 'anonymous', result);
    } else {
        result = await bot.db.get(msg.guild, 'anonymous');
        if (typeof result == 'undefined') result = true;
    }

    let emoji;
    let status;
    if (result) {
        emoji = ':detective:';
        status = 'anonymous';
    } else {
        emoji = ':adult:';
        status = 'not anonymous';
    }

    await send(msg.channel, `${emoji}  |  **Messenger Daemon is now ${status}**`);
};

const usage = new Map();
usage.set('', 'Displays current anonymous status');
usage.set('[on|off]', 'Changes current anonymous status');
exports.usage = usage;

exports.config = {
    name: 'Anonymous Messages',
    cmd: 'anonymous',
    alias: ['anon'],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Turns Channel Anonymous or Not',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
