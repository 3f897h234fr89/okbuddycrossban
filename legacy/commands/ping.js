module.exports = {
    name: 'ping',
    description: 'Displays the current bot delay in ms',
    async callback(interaction) {
        interaction.channel.send('‍').then(resultMessage => {
			const ping = resultMessage.createdTimestamp - interaction.createdTimestamp;
			resultMessage.delete();
            interaction.reply(`Current ping: ${ping}ms`);
		});
    }
};
