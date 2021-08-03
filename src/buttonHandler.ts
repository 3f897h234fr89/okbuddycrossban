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
            util.disableButtons(interaction);
            interaction.followUp({ content: 'Left guild' });
            util.leaveGuild(BigInt(args[1]), client);
            break;
    
        case 'accept': 
            util.disableButtons(interaction);
            interaction.followUp({ content: 'Accepted guild' });
            util.acceptGuild(args, client, interaction);
            break;

        case 'reject':
            util.disableButtons(interaction);
            interaction.followUp({ content: 'Rejected guild' });
            util.leaveGuild(BigInt(`${args[1]}`), client);
            break;

        case 'share':
            util.disableButtons(interaction);
            interaction.followUp({ content: `<@${interaction.user.id}> shared this ban` });
            util.shareBan(args[1], client);
            break;
        
        case 'cancel':
            util.disableButtons(interaction);
            interaction.followUp({ content: `<@${interaction.user.id}> canceled the sharing of this ban` });
            break;

        case 'ban':
            util.applyBan(args, interaction, client)
            util.disableButtons(interaction);
            interaction.followUp({ content: `<@${interaction.user.id}> applied this ban` });
            break;
    }
}
