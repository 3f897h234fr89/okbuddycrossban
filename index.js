const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require("discord-buttons");
disbut(client);

const config = require('./config.json');
const NodeCache = require( "node-cache" );
const fs = require('fs');
const myCache = new NodeCache();

var staffChannelsMap = new Map(Object.entries(JSON.parse(fs.readFileSync('guilds.json', 'utf-8'))));

const createButton = (label, style, ID) => {
    return new disbut.MessageButton()
        .setLabel(label)
        .setStyle(style)
        .setID(ID);
}

client.on('clickButton', async (button) => {
    const { channel, clicker, guild, id, message } = button;
    const args = id.split('-');

    clicker.fetch().then(() => {
        const member = guild.members.cache.get(clicker.id);
        if (!member.hasPermission('BAN_MEMBERS')) {
            channel.send(`<@${clicker.id}> you need the permission \`BAN_MEMBERS\` to be able to interact with this bot`);
            return;
        }
    });

    switch (args[0]) {
        case 'delete_prompt' :
            clicker.fetch().then(() => {
                channel.send(`<@${clicker.id}> cancelled the sharing of the ban of user <@${args[2]}>`);
                message.delete();
            });
        break;

        case 'share_prompt' :
            const bannedUser = client.users.cache.get(args[2]);
            const bannedGuild = client.guilds.cache.get(args[1]);
            const reason = myCache.get(args[2]);

            const sharedEmbed = new Discord.MessageEmbed()
                .setColor('#f54e42')
                .setAuthor(`${bannedUser.tag} was banned in ${bannedGuild.name}`, bannedUser.avatarURL())
                .setDescription(`**Reason**: ${reason || unspecified}`)
                .setFooter('Apply this ban to this server?');

            let yesButton = createButton('Yes', 'green', `ban_request-${bannedGuild.id}-${bannedUser.id}`);
            let noButton = createButton('No', 'red', `cancel_ban_request-${bannedGuild.id}-${bannedUser.id}`)

            let row = new disbut.MessageActionRow()
                .addComponents(yesButton, noButton);

            channel.send(`<@${clicker.id}> shared the ban of <@${args[2]}>`);
            message.delete();
        
            staffChannelsMap.values().forEach(channel => {
                client.channels.fetch(channel).then((channel) => {
                    channel.guild.fetchBans().then((bans) => { 
                        if(bans.get(bannedUser.id)) {
                            return;
                        } else {
                           channel.send(sharedEmbed, row);
                       }
                    });
                });
            });
        break;

        case 'cancel_ban_request': 
            clicker.fetch().then(() => {
                channel.send(`<@${clicker.id}> rejected the shared ban of <@${args[2]}>`);
                message.delete();
            });
        break;

        case 'ban_request' :
            clicker.fetch().then(() => {
                const userToBan = client.users.cache.get(args[2]);
                const originGuild = client.guilds.cache.get(args[1]);
                const reason = `Cross ban from ${originGuild.name}: ` + myCache.get(args[2]);
    
                channel.send(`<@${clicker.id}> has accepted the shared ban reqeust of <@${args[2]}> from ${originGuild.name}`);
                message.delete();
                
                guild.members.ban(userToBan.id, {reason: reason}).then(user => {
                    const bannedEmbed = new Discord.MessageEmbed()
                        .setColor('#f54e42')
                        .setAuthor(`${user.tag} was banned`, userToBan.avatarURL())
                        .setDescription(`**Reason**: ${reason}`);
                    channel.send(bannedEmbed);
                })
            });
        break;
    }
});

client.on('guildBanAdd', (guild, user) => {
    guild.fetchBans().then((bans) => {
        const reason = bans.get(user.id).reason;

        if (reason.includes('Cross ban')) {
            return;
        }

        const shareEmbed = new Discord.MessageEmbed()
            .setColor('#f54e42')
            .setAuthor(`${user.tag} was banned from ${guild.name}`, user.avatarURL())
            .setDescription(`**Reason**: ${reason || 'unspecified'}`)
            .setFooter('Share this ban with the other servers?');

        let shareButton = createButton('Share', 'green', `share_prompt-${guild.id}-${user.id}`);
        let cancelButton = createButton('Cancel', 'red', `delete_prompt-${guild.id}-${user.id}`);
        let row = new disbut.MessageActionRow()
            .addComponents(shareButton, cancelButton);
        
        myCache.set(user.id, reason);

        client.channels.fetch(staffChannelsMap.get(guild.id)).then((channel) => {
            channel.send(shareEmbed, row);
        });
    });
});

client.login(config.token);
