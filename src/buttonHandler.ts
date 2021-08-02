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
        case 'leave':
            util.leaveGuild(BigInt(args[1]), client);
            break;
    
        default:
            break;
    }
}
