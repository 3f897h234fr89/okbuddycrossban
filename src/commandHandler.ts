import * as Discord from 'discord.js';
import * as util from './util';

export async function handleCommand(interaction: Discord.CommandInteraction, client: Discord.Client) {
    if (!interaction.guild) {
        return;
    }

    switch(interaction.commandName) {
        case 'ping': 
            await interaction.reply({
                content: `Current ping: ${(Date.now() - interaction.createdTimestamp) - client.ws.ping}ms`,
                ephemeral: true
            });
            break;
            
        case 'register':
            await interaction.reply({
                content: 'A request has been sent to the bot owner',
                ephemeral: true
            });
            await util.requestNetwork(interaction, client);
            break;
        
        case 'github': 
            await interaction.reply({
                content: 'https://github.com/paisu46/okbuddycrossban',
                ephemeral: true
            });
            break;

        default:
            throw new Error(`Unkown command: ${interaction.commandName}`);
            break;
    }
    const date = new Date();
    console.log(`[${util.colors.fg.yellow}!${util.colors.reset}] Executed command '${interaction.commandName}' for user '${interaction.user.tag}' in '${interaction.guild.name || 'dms'}' at ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`);
}
