module.exports = {
    name: 'interactionCreate',
    async callback(interaction, client) {
        if (!interaction.isCommand()) {
            return;
        }

        if (!client.commands.has(interaction.commandName)) {
            return;
        }

        try {
            await client.commands.get(interaction.commandName).callback(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: 'An error occured while executing this command',
                ephermal: true
            });
        }
    }
}
