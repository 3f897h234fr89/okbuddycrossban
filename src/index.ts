import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGES');
const client = new Discord.Client({intents: intents});

import * as dotenv from 'dotenv';
dotenv.config();

import { colors } from './util/console_colors';

client.once('ready', () => {
    console.log(`${colors.fg.green} ✓ ${colors.reset} ${client.user.tag} is now up`);
});

client.on('messageCreate', async (message) => { 
    if (message.author.id != '717823747670802523') {
        return;
    }
    
    if (message.channel.type !== 'DM') {
        const clientMember = await message.guild.members.fetch(client.user.id);
        if (clientMember.permissionsIn(message.channel).missing(['SEND_MESSAGES'])) {
            console.log(clientMember.permissionsIn(message.channel).missing(['SEND_MESSAGES']));
        }
    }

    const prefix = '!';
    if(!message.content.startsWith(prefix)) {
        return;
    }

    const command = message.content.split(' ')[0].replace(prefix, '');
    const args = message.content.replace(`${prefix}${command}`, '').split(' ');
    switch (command) {
        case 'ping':
            message.channel.send(`pong! Current ping: ${message.createdTimestamp - Date.now()}ms`);
            break;
    
        default:
            message.channel.send(`Invalid command: \`${command}\``);
            break;
    }
});

client.on('interactionCreate', (interaction) => {
    console.log(interaction);
});

client.login(process.env.token);
