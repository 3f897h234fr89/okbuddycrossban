import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGES');
const client = new Discord.Client({intents: intents});

import * as dotenv from 'dotenv';
dotenv.config();
import { colors } from './util/console_colors';

// import * as interactionsClient from 'discord-slash-commands-client'; // Only used to register commands
// let interactionClient: interactionsClient.Client;
// async function registerCommands() {
//     interactionClient.createCommand({
//         name: 'ping',
//         description: 'Gets the current bot delay.'
//     });

//     interactionClient.createCommand({
//         name: 'github',
//         description: 'Get the link to the Github repository.'
//     });

//     interactionClient.createCommand({
//         name: 'register',
//         description: 'Request to register with the network.',
//         options: [
//             {
//                 name: 'Staff/Mod channel',
//                 description: 'The current staff/mod channel of your server',
//                 type: 7,
//                 required: true
//             }
//         ]
//     });
// }

client.once('ready', () => {
    console.log(`${colors.fg.green} ✓ ${colors.reset} ${client.user.tag} is now up`);
    client.user.setActivity({
        type: 'WATCHING',
        name: 'you'
    });

    // interactionClient = new interactionsClient.Client(process.env.token, client.user.id.toString());
    // registerCommands();
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
        { name: 'Member count', value: guild.memberCount.toString() },
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

client.on('guildCreate', guild => {
    sendGuildJoinNotification(guild);
});

client.on('interactionCreate', (interaction) => {
    console.log(interaction);
});

client.login(process.env.token);
