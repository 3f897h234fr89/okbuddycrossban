import * as Discord from 'discord.js';
const intents = new Discord.Intents().add('GUILDS', 'GUILD_BANS', 'DIRECT_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGES');
const client = new Discord.Client({intents: intents});

import * as dotenv from 'dotenv';
dotenv.config();
import * as util from './util';

client.once('ready', async () => {
    console.log(`[${util.colors.fg.green}✓${util.colors.reset}] ${client.user.tag} is now up`);
    client.user.setActivity({
        type: 'WATCHING',
        name: 'bans'
    });

    // await setupInteractions();
});

// Uncomment this if you need to register commands
// import * as interactionHelper from './interactionHelper';
// async function setupInteractions() {
//     await interactionHelper.setup(client.user.id.toString());
//     await interactionHelper.printCommands(client.user.id.toString());
// }

client.on('guildCreate', async guild => {
    await util.sendGuildJoinNotification(guild, client);
});

client.on('guildDelete', async guild => {
    await util.removeFromNetwork(guild.id);
});

client.on('guildBanAdd', async ban => {
    if (!await util.isPartOfNetwork(ban.guild.id)) {
        return;
    }
    await util.askToShare(ban.guild.id, client, ban);
    
});

import { handleButton } from './buttonHandler';
import { handleCommand } from './commandHandler';
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        await handleButton(interaction, client);
    } else if (interaction.isCommand()) {
        await handleCommand(interaction, client);
    }
});

client.login(process.env.token);
