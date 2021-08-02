import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGES');
const client = new Discord.Client({intents: intents});
import * as interactionHelper from './interactionHelper';

import * as dotenv from 'dotenv';
dotenv.config();
import { colors } from './colors';

client.once('ready', async () => {
    console.log(`${colors.fg.green} ✓ ${colors.reset} ${client.user.tag} is now up`);
    client.user.setActivity({
        type: 'WATCHING',
        name: 'you'
    });

    /*
    ----------------------------------------------------------
    Uncomment this if you have not registered the commands yet
    ----------------------------------------------------------
    */

    // interactionHelper.setup(client.user.id.toString());
    // interactionHelper.printCommands(client.user.id.toString());

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

    host.send({ embeds: [embed], components: [component] });
}

client.on('guildCreate', guild => {
    sendGuildJoinNotification(guild);
});

import { handleButton } from './buttonHandler';
client.on('interactionCreate', async (interaction) => {
    const channel = await interaction.guild.channels.fetch(BigInt('871002752996757574')) as Discord.TextChannel;
    const component = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
        .setLabel('asdasd')
        .setStyle('PRIMARY')
        .setCustomId('dskalfhjg')
    );
    channel.send({content: 'deez', components: [component]});

    if (interaction.isButton()) {
        handleButton(interaction, client);
    }
});

client.login(process.env.token);
