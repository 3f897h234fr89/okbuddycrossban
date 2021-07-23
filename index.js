const { Client, Intents, MessageEmbed } = require('discord.js');
const intents = new Intents();
intents.add('GUILDS', 'GUILD_BANS');
const client = new Client({ intents: intents });

require('dotenv').config();
const NodeCache = require('node-cache');
global.cache = new NodeCache();

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_PATH);

const adler32 = require('adler32');
const debugGuildId = '865190393221873714';

const app = (guildID) => {
    return guildID ? client.api.applications(client.user.id).guilds(guildID) : client.api.applications(client.user.id);
}

client.once('ready', async () => {
    console.log(`${client.user.tag} is now online.`);
    client.user.setActivity('THE WORLD BURN', {
        type: 'WATCHING'
    });
});

client.on('guildCreate', (guild) => {
    // TODO: DM embed with the info to the bot host for moderation instead of this
    console.log(`Joined new guild: ${guild.name}, id: ${guild.id}, member count: ${guild.memberCount}, vanity invite: ${guild.vanityURLCode || 'none'}`);

    app(guild.id).commands.post({
        data: {
            name: 'ping',
            description: 'Gets the current bot response time in milliseconds.'
        }
    });

    app(guild.id).commands.post({
        data: {
            name: 'register',
            description: 'Request to register the server with the network.',
            options: [
                {
                    name: 'channel',
                    description: 'Your server\'s staff channel',
                    required: true,
                    type: 7
                },
                {
                    name: 'message',
                    description: 'Optional register request message.',
                    required: false,
                    type: 3
                }
            ]
        }
    })
});

client.on('guildBanAdd', (ban) => {
    // TODO: Leave the guild if server is not registered in
    // the network.
    const [guild, user] = [ban.guild, ban.user];

    guild.bans.fetch(user.id).then(banInfo => {
        const reason = banInfo.reason;
        const key = adler32.sum(user.id + guild.id);
        const banData = {
            user: user,
            guild: guild,
            reason: reason
        }
        cache.set(key, banData);
    });

    // TODO: Send embeds
});

client.on('interactionCreate', async (interaction) => {
    if(interaction.isButton()) {
        // TODO: Implement button logic
    } else {
        // TODO: Implement command logic
    }
});

client.login(process.env.DISCORD_TOKEN);
