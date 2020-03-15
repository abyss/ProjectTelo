const bot = require('../../bot');
const { asyncForEach } = require('../../utils/general');
const { send } = require('../../utils/chat');
const { randomColor } = require('../../utils/colors');
const RichEmbed = require('discord.js').RichEmbed;
const moment = require('moment');

exports.config = {
    name: 'AnonChannel',
    description: 'Create an anonymous text channel',
    debug: false
};

async function unlockTimer() {
    const lockTimer = await bot.db.get(process.env.PRIMARY_SERVER, 'lockTimer');
    if (!lockTimer) return;

    const primaryGuildId = process.env.PRIMARY_SERVER;
    const modChannel = bot.client.channels.get(process.env.MOD_CHANNEL);

    const timer = moment(lockTimer);
    if (timer.isBefore()) {
        await bot.db.set(primaryGuildId, 'lockTimer', 0);
        await bot.db.set(primaryGuildId, 'lock', true);
        await send(modChannel, ':lock:  |  **Mason Chat is now locked**');

        let players = await bot.db.get(primaryGuildId, 'players');
        if (typeof players === 'undefined') players = [];

        await asyncForEach(players, async uid => {
            const user = bot.client.users.get(uid);
            await send(user, ':lock:  |  **Mason Chat is now locked**');
        });
    }
}

bot.client.on('ready', () => {
    bot.client.setInterval(unlockTimer, 1000);
});

bot.client.on('message', async message => {
    if (message.channel.type !== 'dm') return;
    if (message.author.bot) return;

    const primaryGuildId = process.env.PRIMARY_SERVER;
    const modChannel = bot.client.channels.get(process.env.MOD_CHANNEL);

    let players = await bot.db.get(primaryGuildId, 'players');
    if (typeof players === 'undefined') players = [];

    if (!players.includes(message.author.id)) return;

    const locked = await bot.db.get(primaryGuildId, 'lock') || false;
    if (locked) {
        await message.react('❌');
        await send(message.channel, ':x:  |  Mason Chat is currently locked!');
        return;
    }

    if (message.content.length > 1950) {
        await message.react('❌');
        await send(message.channel, ':x:  |  Your message was over 1950 characters! Please send shorter messages!');
        return;
    }

    const color = randomColor();
    await asyncForEach(players, async uid => {
        if (uid == message.author.id) return; // Skip sender
        const user = bot.client.users.get(uid);

        const output = new RichEmbed()
            .setColor(color)
            .setDescription(message.content);

        await send(user, { embed: output });
    });

    const modOutput = new RichEmbed()
        .setColor(color)
        .setDescription(message.content)
        .setFooter(message.author.username, message.author.avatarURL)
        .setTimestamp(message.createdAt);

    await send(modChannel, { embed: modOutput });
    await message.react('📨');
});
