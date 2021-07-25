const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
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
                    description: 'The staff channel of your server.',
                    required: true,
                    type: 7
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

client.on('guildBanAdd', async (ban) => {
    // TODO: Return if the guild is not part of the network
    const [guild, user] = [ban.guild, ban.user];
    const redisPrefix = 'crossbans-channel-';


    guild.bans.fetch(user.id).then(async banInfo => {
        const reason = banInfo.reason;
        const key = adler32.sum(user.id + guild.id);
        const banData = {
            user: user,
            guild: guild,
            reason: reason
        }
        cache.set(key, banData);

        const shareEmbed = new MessageEmbed()
            .setAuthor(`${user.tag} was banned`, user.avatarURL())
            .setDescription(`**Reason:** ${reason}`)
            .setFooter('Share this ban with the network?');

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Share')
                    .setStyle('SUCCESS')
                    .setCustomId(`share-${key}`),
                new MessageButton()
                    .setLabel('Don\'t share')
                    .setStyle('DANGER')
                    .setCustomId(`cancel-${key}`)
            );

        const staffChannelID = await redis.get(redisPrefix + guild.id);
        const staffChannel = await client.channels.fetch(staffChannelID);

        staffChannel.send({ embeds: [shareEmbed], components: [row] });
    });
});

client.on('interactionCreate', async (interaction) => {
    const { guild, user, options, member, customId } = interaction;

    if(interaction.isButton()) {
        // TODO: Implement button logic
        const args = customId.split('-');
        
        switch (args[0]) {
            case 'leave':
                client.guilds.fetch(args[1]).then(async guild => {
                    await interaction.update({ embeds: interaction.message.embeds, components: [] });
                    await interaction.followUp(`Left guild "${guild.name}" with ${guild.memberCount} members. \n\`GUID:${guild.id}\``);
                    guild.leave();
                });
                break;

            case 'share': 

                break;

            case 'cancel':
                await interaction.update({ embeds: interaction.message.embeds, components: [] });
                await interaction.followUp(`<@${user.id}> has canceled the sharing of this ban.`);
                cache.delete(args[1]);
                break;
            
            case 'accept':
                const redisPrefix = 'crossbans-channel-';
                await redis.set(redisPrefix + args[1], args[2]);
                interaction.reply(`Accepted guild "${guild.name}"`);
                client.channels.fetch(args[2]).then(channel => {
                    channel.send('The bot owner has accepted the request to join the network.');
                });
                break;
            
            case 'reject':
                client.channels.fetch(args[2]).then(async channel => {
                    channel.send('The bot owner has rejected the request to join the network.');
                    client.guilds.fetch(args[1]).then(guild => {
                        guild.leave();
                    });
                    await interaction.update({ embeds: interaction.message.embeds, components: [] });
                    await interaction.followUp('Rejected the join request');
                });
                break;
        
            default:
                throw new Error(`Invalid button: ${args[0]}`);
        }
    } else if (interaction.isCommand()){
        switch (interaction.commandName) {
            case 'ping':
                // TODO: FIX THIS SHIT
                interaction.channel.send('‍').then(async message => {
                    const ping = message.createdTimestamp - interaction.createdTimestamp;
                    message.delete();
                    await interaction.reply({ content: `Current ping: ${ping}ms`, ephemeral: true });
                });
                break;

            case 'register':
                if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    await interaction.reply({ content: 'You do not have permission to execute this command', ephemeral: true });
                    return;
                }

                client.users.fetch(process.env.HOST_ID).then(async host => {
                    const embedGuild = new MessageEmbed()
                        .setAuthor(guild.name, guild.iconURL())
                        .setDescription(`Member count: ${guild.memberCount}`)
                        .setFooter('This server is asking to be accepted in the network.');
                    const embedAuthor = new MessageEmbed()
                        .setAuthor(user.tag, user.avatarURL())
                        .setDescription(`GUID: ${guild.id}\nUUID: ${user.id}`)
                        .setFooter('Request Author');

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setLabel('Accept')
                                .setStyle('SUCCESS')
                                .setCustomId(`accept-${guild.id}-${options.get('channel').channel.id}`),
                            new MessageButton()
                                .setLabel('Reject')
                                .setStyle('DANGER')
                                .setCustomId(`reject-${guild.id}-${options.get('channel').channel.id}`)
                        );

                    host.send({ embeds: [embedGuild, embedAuthor], components: [row] });
                });
                
                await interaction.reply({ content: 'A request has been sent to the bot owner.', ephemeral: true });
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
