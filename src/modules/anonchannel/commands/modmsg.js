const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const { asyncForEach } = require('../../../utils/general');
const { randomColor } = require('../../../utils/colors');
const RichEmbed = require('discord.js').RichEmbed;

exports.run = async (message, args) => {
    const primaryGuildId = process.env.PRIMARY_SERVER;
    const modChannel = bot.client.channels.get(process.env.MOD_CHANNEL);

    let players = await bot.db.get(primaryGuildId, 'players');
    if (typeof players === 'undefined') players = [];

    if (args.join(' ') > 1950) {
        await message.react('❌');
        await send(message.channel, ':x:  |  Your message was over 1950 characters! Please send shorter messages!');
        return;
    }

    const color = randomColor();
    await asyncForEach(players, async uid => {
        const user = bot.client.users.get(uid);

        const output = new RichEmbed()
            .setColor(color)
            .setDescription(args.join(' '))
            .setTitle('**Message from the Moderators:**');

        await send(user, { embed: output });
    });

    const modOutput = new RichEmbed()
        .setColor(color)
        .setDescription(args.join(' '))
        .setTitle('**Message from the Moderators:**')
        .setFooter(message.author.username, message.author.avatarURL)
        .setTimestamp(message.createdAt);

    await send(modChannel, { embed: modOutput });
    await send(message.channel, ':ok_hand:  |  **Mod Message has been sent!**');
};

const usage = new Map();
usage.set('(message)', 'Send a message from the mods to the channel');
exports.usage = usage;

exports.config = {
    name: 'Moderator Message',
    cmd: 'modmsg',
    alias: ['modmessage', 'msg'],
    botPermissions: [], // Permissions needed by the bot to use this command.
    defaultPermissions: ['MANAGE_GUILD'], // Default permissions to use this command by user
    location: 'GUILD_ONLY', // 'GUILD_ONLY', 'DM_ONLY', 'ALL'
    description: 'Send a message from the mods to the channel',
    debug: false // This makes it unusable to anyone besides process.env.OWNER
};
