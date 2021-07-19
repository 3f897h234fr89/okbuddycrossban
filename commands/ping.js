module.exports = {
    name: 'ping',
    description: 'Gets the current bot delay',
    async callback(interaction) {
        interaction.channel.send('‍').then(resultMessage => {
			const ping = resultMessage.createdTimestamp - interaction.createdTimestamp;
			resultMessage.delete();
            interaction.reply(`Current ping: ${ping}ms`);
		});
    }
};
