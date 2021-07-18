const { Client, Intents } = require('discord.js');
const intents = new Intents();
intents.add('GUILDS', 'GUILD_BANS', 'GUILD_MESSAGES');
const client = new Client({ intents: intents });

const fs = require('fs');
require('dotenv').config();
 
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
events.forEach(eventFile => {
    const event = require(`./events/${eventFile}`);
    client.on(event.name, (...args) => event.callback(...args, client));
});

client.login(process.env.token);
