import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS');
const client = new Discord.Client({intents: intents});

import * as dotenv from 'dotenv';
dotenv.config();

client.once('ready', () => {
    console.log(`${client.user.tag} is now online!`);
});

client.login(process.env.token);
