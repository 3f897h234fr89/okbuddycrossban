import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGES');
const client = new Discord.Client({intents: intents});

import { DiscordInteractions } from "slash-commands"; // Only used to register commands
const DI_interaction = new DiscordInteractions({
    applicationId: client.application.id.toString(),
    authToken: process.env.token,
    publicKey: client.user.id.toString()
});

import * as dotenv from 'dotenv';
dotenv.config();

import { colors } from './util/console_colors';

client.once('ready', () => {
    console.log(`${colors.fg.green} ✓ ${colors.reset} ${client.user.tag} is now up`);
    client.user.setActivity({
        type: 'WATCHING',
        name: 'you'
    });
});

async function getHost() {
    const hostId:bigint = BigInt(process.env.host_id);
    return await client.users.fetch(hostId); // Will throw an error if a non valid host id is provided
}

async function sendGuildJoinNotification(guild: Discord.Guild) {
    const host = await getHost();
    var date = new Date();

    const embed = new Discord.MessageEmbed()
    .setAuthor(guild.name, guild.iconURL())
    .addFields(
        { name: 'Guild id', value: guild.id.toString() },
        { name: 'Member count', value: guild.memberCount.toPrecision(21).toString() },
        { name: 'Guild owner id', value: guild.ownerId.toString() },
        { name: 'Vanity invite', value: guild.vanityURLCode || 'none'}
    ) .setFooter(date.toISOString());

    const component = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
        .setLabel('Leave')
        .setStyle('DANGER')
        .setCustomId(`leave-${guild.id}`)
    );

    host.send({ embeds: [embed], components: [component] })
}

async function registerCommands(guild: Discord.Guild) {
    const ping = {
        name: 'ping',
        description: 'Gets the current bot response time.'
    }

    await DI_interaction.createApplicationCommand(ping, guild.id.toString());

    const github = {
        name: 'github',
        description: 'Get the link to the GitHub repository.'
    }

    await DI_interaction.createApplicationCommand(github, guild.id.toString());

    const register = {
        name: 'register',
        description: 'Request to register this guild with the network.',
        options: [
            {
                name: 'Mod/Staff channel',
                description: 'the channel used by the moderation team of this server',
                type: 7
            },
        ],
    };

    await DI_interaction.createApplicationCommand(register, guild.id.toString());
}

client.on('guildCreate', guild => {
    sendGuildJoinNotification(guild);
    registerCommands(guild);
});

client.on('interactionCreate', (interaction) => {
    console.log(interaction);
});

client.login(process.env.token);
