const adler32 = require('adler32');

module.exports = {
    name: 'guildBanAdd',
    callback(ban) {
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
        });
    }
}
