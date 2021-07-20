const { Client, Intents } = require('discord.js');
global.Discord = require('discord.js');
const intents = new Intents();
intents.add('GUILDS', 'GUILD_BANS', 'GUILD_MESSAGES');
const client = new Client({ intents: intents });

const fs = require('fs');
require('dotenv').config();
const NodeCache = require( "node-cache" );
global.cache = new NodeCache();
 
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
events.forEach(eventFile => {
    const event = require(`./events/${eventFile}`);
    client.on(event.name, (...args) => event.callback(...args, client));
});

client.commands = new Discord.Collection();
const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commands.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
});

client.login(process.env.token);
