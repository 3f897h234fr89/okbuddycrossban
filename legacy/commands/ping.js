module.exports = {
    name: 'ping',
    description: 'Displays the current bot delay in ms',
    async callback(interaction) {
        interaction.channel.send('‍').then(message => {
			const ping = message.createdTimestamp - interaction.createdTimestamp;
			message.delete();
            interaction.reply(`Current ping: ${ping}ms`);
		});
    }
};
