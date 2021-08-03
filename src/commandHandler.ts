import * as Discord from 'discord.js';
import * as util from './util';

export async function handleCommand(interaction: Discord.CommandInteraction, client: Discord.Client) {
    switch(interaction.commandName) {
        case 'ping': 
            interaction.reply({
                content: `Current ping: ${interaction.createdTimestamp - Date.now()}ms`,
                ephemeral: true
            });
        case 'register':
            util.requestNetwork(interaction, client);
            break;
        
        case 'github': 
            interaction.reply({
                content: 'https://github.com/paisu46/okbuddycrossban',
                ephemeral: true
            });
            break;
    }
    const date = new Date();
    console.log(`[${util.colors.fg.yellow}!${util.colors.reset}] Executed command '${interaction.commandName}' for user '${interaction.user.tag}' in '${interaction.guild.name || 'dms'}' at ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`);
}
