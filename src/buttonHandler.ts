import * as Discord from 'discord.js';
import * as util from './util';

export async function handleButton(interaction: Discord.ButtonInteraction, client: Discord.Client) {
    if (interaction.channel instanceof Discord.TextChannel) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(Discord.Permissions.FLAGS.BAN_MEMBERS)) {
            await interaction.followUp({
                content: `You need the \`BAN_MEMBERS\` permission to be able to make decisions on bans.`,
                ephemeral: true
            });
            return;
        }
    }

    const args = interaction.customId.split('-');
    switch (args[0]) {   
        case 'accept': 
            await util.acceptGuild(args, client, interaction);
            await interaction.followUp({ content: 'Accepted guild' });
            break;

        case 'reject':
            await util.disableButtons(interaction);
            await interaction.followUp({ content: 'Rejected guild' });
            // await util.leaveGuild(BigInt(args[1]), client);
            break;

        case 'share':
            await util.disableButtons(interaction);
            await util.shareBan(args[1], client);
            await interaction.followUp({ content: `<@${interaction.user.id}> shared this ban` });
            break;
        
        case 'cancel':
            await util.disableButtons(interaction);
            await interaction.followUp({ content: `<@${interaction.user.id}> canceled the sharing of this ban` });
            break;

        case 'ban':
            await util.applyBan(args, interaction, client)
            break;

        default:
            throw new Error(`Unkown button interaction: ${args[0]}`);
            break;
    }

    const date = new Date();
    console.log(`[${util.colors.fg.yellow}!${util.colors.reset}] Executed button interaction '${args[0]}' for user '${interaction.user.tag}' at ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`);
}
