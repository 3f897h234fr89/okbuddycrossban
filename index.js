const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const intents = new Intents();
intents.add('GUILDS', 'GUILD_BANS', 'GUILD_MEMBERS');
const client = new Client({ intents: intents });

require('dotenv').config();
const adler32 = require('adler32');
const NodeCache = require('node-cache');
global.cache = new NodeCache();

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_PATH);

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

client.on('guildCreate', async (guild) => {
    client.users.fetch(process.env.HOST_ID).then(async host => {
        var date = new Date();
        const embed = new MessageEmbed()
            .setAuthor(guild.name, guild.iconURL())
            .addFields(
                { name: 'Guild id', value: guild.id.toString() },
                { name: 'Member count', value: guild.memberCount.toString() },
                { name: 'Vanity invite', value: guild.vanityURLCode || 'false' }
            )
            .setFooter(`Joined at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} | ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Leave')
                    .setStyle('DANGER')
                    .setCustomId(`leave-${guild.id}`),
                new MessageButton()
                    .setLabel('Ignore')
                    .setStyle('SECONDARY')
                    .setCustomId(`ignore-${guild.id}`)
            );

        host.send({ embeds: [embed], components: [row] });
    });

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
                    description: 'Your server\'s staff channel. (Don\'t forget to give the bot message and embed perms in the specified channel)',
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
    });

    app(guild.id).commands.post({
        data: {
            name: 'github',
            description: 'View the github repository containing the source code.'
        }
    });
});

client.on('guildBanAdd', (ban) => {
    // TODO: Return if the guild is not part of the network
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
    } else if (interaction.isCommand()){
        switch (interaction.commandName) {
            case 'ping':
                interaction.channel.send('‍').then(async message => {
                    const ping = message.createdTimestamp - interaction.createdTimestamp;
                    message.delete();
                    await interaction.reply({ content: `Current ping: ${ping}ms`, ephemeral: true });
                });
                break;

            case 'register':
                await interaction.reply({ content: 'WORK IN PROGRESS', ephemeral: true });
                break;

            case 'github':
                await interaction.reply({ content: 'https://github.com/3f897h234fr89/okbuddycrossban', ephemeral: true });
                break;

            default:
                console.error(`Invalid command: ${interaction.commandName}`);
                break;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
