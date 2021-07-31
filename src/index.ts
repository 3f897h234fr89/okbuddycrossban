import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS');
const client = new Discord.Client({intents: intents});

import * as dotenv from 'dotenv';
dotenv.config();

import { colors } from './util/console_colors';

client.once('ready', () => {
    console.log(`${colors.fg.green} ✓ ${colors.reset} ${client.user.tag} is now up`);
});

client.login(process.env.token);
