const Discord = require('discord.js');
const client = new Discord.Client({intents:['GUILDS', 'GUILD_BANS']});

const config = require('./config.json');
const NodeCache = require( "node-cache" );
const fs = require('fs');
const myCache = new NodeCache();

var staffChannelsMap = new Map(Object.entries(JSON.parse(fs.readFileSync('guilds.json', 'utf-8'))));

const createButton = (label, style, ID) => {
    return new Discord.MessageButton()
        .setLabel(label)
        .setStyle(style)
        .setCustomId(ID);
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        const { channel, member, guild, customId, message } = interaction;
        const args = customId.split('-');

        member?.fetch().then(() => {
            const banned = guild.members.cache.get(member.id);
            if (!banned.permissions.has(Discord.Permissions.FLAGS.BAN_MEMBERS)) {
                channel.send(`<@${member.id}> you need the permission \`BAN_MEMBERS\` to be able to interact with this bot`);
                return;
            }
        });

        switch (args[0]) {
            case 'delete_prompt' :
                member.fetch().then(() => {
                    channel.send(`<@${member.id}> cancelled the sharing of the ban of user <@${args[2]}>`);
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

                let yesButton = createButton('Yes', 'SUCCESS', `ban_request-${bannedGuild.id}-${bannedUser.id}`);
                let noButton = createButton('No', 'DANGER', `cancel_ban_request-${bannedGuild.id}-${bannedUser.id}`)

                let row = new Discord.MessageActionRow()
                    .addComponents(yesButton, noButton);

                channel.send(`<@${member.id}> shared the ban of <@${args[2]}>`);
                message.delete();
            
                for (let channel of staffChannelsMap.values()) {
                    client.channels.fetch(channel).then((channel) => {
                        channel.guild.bans.fetch().then((bans) => { 
                            if(bans.get(bannedUser.id)) {
                                return;
                            } else {
                                channel.send({ embeds: [shareEmbed], components: [row]});
                        }
                        });
                    });
                }
            break;

            case 'cancel_ban_request': 
                member.fetch().then(() => {
                    channel.send(`<@${member.id}> rejected the shared ban of <@${args[2]}>`);
                    message.delete();
                });
            break;

            case 'ban_request' :
                member.fetch().then(() => {
                    const userToBan = client.users.cache.get(args[2]);
                    const originGuild = client.guilds.cache.get(args[1]);
                    const reason = `Cross ban from ${originGuild.name}: ` + myCache.get(args[2]);
        
                    channel.send(`<@${member.id}> has accepted the shared ban reqeust of <@${args[2]}> from ${originGuild.name}`);
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

            case 'allow_prompt' :
                staffChannelsMap[interaction.guildId] = interaction.channelId;
                client.channels.fetch(args[2]).then((guild_channel) => {
                    guild_channel.send("Bot owner has accepted the register request!");
                    channel.send(`${args[1]} was successfully allowed into the network.`)
                    message.delete();
                });
                
            break;

            case 'decline_prompt' :
                client.channels.fetch(args[2]).then((guild_channel) => {
                    guild_channel.send("Bot owner has declined the register request.");
                    channel.send(`${args[1]} was declined from joining the network.`)
                    message.delete();
                });
            break;
        }
    } else if (interaction.isCommand()) {
        if (interaction.commandName === 'register') {
            if (staffChannelsMap.has(interaction.guildId)) {
                interaction.reply("This server is already registered in the network!")
                return;
            }
            // Reply to the command
            interaction.reply("Sending request to bot owner to accept...");

            // TODO: set up request system to bot owner to accept said requests
            // register guild in map
            client.users.fetch(config.authorId, false).then((user) => {
                const verifyEmbed = new Discord.MessageEmbed()
                    .setColor('#f54e42')
                    .setAuthor('New cross-ban network registration request', interaction.guild.iconURL())
                    .setDescription(`<#${interaction.channelId}> from ${interaction.guild.name} wants to join the network.`)
                    .setFooter('Allow this server to join the network?');
                
                let shareButton = createButton('Share', 'SUCCESS', `allow_prompt-${interaction.guild.name}-${interaction.channel.id}`);
                let cancelButton = createButton('Cancel', 'DANGER', `decline_prompt-${interaction.guild.name}-${interaction.channel.id}`);
    
                let row = new Discord.MessageActionRow()
                    .addComponents(shareButton, cancelButton);

                user.send({ embeds: [verifyEmbed], components: [row]})
            });
        }
    }
});

client.on('guildBanAdd', (ban) => {
    const guild = ban.guild
    const user = ban.user

    guild.bans.fetch(user.id).then((banInfo) => {
        const reason = banInfo.reason;
        if (reason.includes('Cross ban')) {
            return;
        }

        const shareEmbed = new Discord.MessageEmbed()
            .setColor('#f54e42')
            .setAuthor(`${user.tag} was banned from ${guild.name}`, user.avatarURL())
            .setDescription(`**Reason**: ${reason || 'unspecified'}`)
            .setFooter('Share this ban with the other servers?');

        let shareButton = createButton('Share', 'SUCCESS', `share_prompt-${guild.id}-${user.id}`);
        let cancelButton = createButton('Cancel', 'DANGER', `delete_prompt-${guild.id}-${user.id}`);
        let row = new Discord.MessageActionRow()
            .addComponents(shareButton, cancelButton);
        
        myCache.set(user.id, reason);

        client.channels.fetch(staffChannelsMap.get(guild.id)).then((channel) => {
            channel.send({ embeds: [shareEmbed], components: [row]});
        });
    });
});

// https://discord.com/developers/docs/interactions/slash-commands for more info on commandData structure
const commandData = {
    name: 'register',
    description: 'Registers server with the okbuddy ban network.',
};

// handle registration of slash commands
client.once('ready', () => {
    // Creating a guild-specific command
    // TODO: move this to global and not use specific guild
    client.application?.commands.create(commandData);
});
client.login(config.token);

// save the guild map on exit
process.on('exit', () => {
    console.log("Saving guild map...")
    fs.writeFile("guilds.json", JSON.stringify(staffChannelsMap), function(err) {
        if (err) {
            console.log(err);
        }
    });
});