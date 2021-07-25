const adler32 = require('adler32');
const Discord = require('discord.js')

module.exports = {
    name: 'guildBanAdd',
    callback(ban, client) {
        const [guild, user] = [ban.guild, ban.user];
        
        guild.bans.fetch(user.id).then(banInf => {
            const reason = banInf.reason;
            const key = adler32.sum(user.id + guild.id);
            const banInfo = {
                userId: user.id,
                guildId: guild.id,
                reason: reason
            }
            cache.set(key, banInfo);

            const embed = new Discord.MessageEmbed()
                .setAuthor(`${user.tag} was banned`, user.avatarURL())
                .setDescription(`**Reason:** ${reason}`)
                .setFooter('Share this ban with the network?');
            
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setLabel('Share')
                        .setStyle('SUCCESS')
                        .setCustomId(`share-${key}`),
                    new Discord.MessageButton()
                        .setLabel('Don\'t share')
                        .setStyle('DANGER')
                        .setCustomId(`delete-${key}`)
                );
            
            client.channels.fetch('867852342347038781').then(channel => {
                channel.send({ embeds: [embed], components: [row] });
            });
        });
    }
}
