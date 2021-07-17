const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require("discord-buttons");
disbut(client);

const config = require('./config.json');
const NodeCache = require( "node-cache" );
const fs = require('fs');
const myCache = new NodeCache();

var staffChannelsMap = new Map(Object.entries(JSON.parse(fs.readFileSync('guilds.json', 'utf-8'))));

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

    if(args[0] === 'delete_prompt') {
        clicker.fetch().then(() => {
            channel.send(`<@${clicker.id}> cancelled the sharing of the ban of user <@${args[2]}>`);
            message.delete();
        });
    } 

    if(args[0] === 'share_prompt') {
        const bannedUser = client.users.cache.get(args[2]);
        const bannedGuild = client.guilds.cache.get(args[1]);
        const reason = myCache.get(args[2]);

        const sharedEmbed = new Discord.MessageEmbed()
            .setColor('#f54e42')
            .setAuthor(`${bannedUser.tag} was banned in ${bannedGuild.name}`, bannedUser.avatarURL())
            .setDescription(`**Reason**: ${reason || unspecified}`)
            .setFooter('Apply this ban to this server?');

        let yesButton = new disbut.MessageButton()
            .setLabel('Yes')
            .setStyle('green')
            .setID(`ban_request-${bannedGuild.id}-${bannedUser.id}`)

        let noButton = new disbut.MessageButton()
            .setLabel('No')
            .setStyle('red')
            .setID(`cancel_ban_request-${bannedGuild.id}-${bannedUser.id}`);

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
    }

    if(args[0] === 'cancel_ban_request') {
        clicker.fetch().then(() => {
            channel.send(`<@${clicker.id}> rejected the shared ban of <@${args[2]}>`);
            message.delete();
        });
    }

    if(args[0] === 'ban_request') {
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

        let shareButton = new disbut.MessageButton()
            .setLabel('Share')
            .setStyle('green')
            .setID(`share_prompt-${guild.id}-${user.id}`)

        let cancelButton = new disbut.MessageButton()
            .setLabel('Cancel')
            .setStyle('red')
            .setID(`delete_prompt-${guild.id}-${user.id}`);
        
        let row = new disbut.MessageActionRow()
            .addComponents(shareButton, cancelButton);
        
        myCache.set(user.id, reason);

        client.channels.fetch(staffChannelsMap.get(guild.id)).then((channel) => {
            channel.send(shareEmbed, row);
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
    client.guilds.cache.get('854851946855006238').commands.create(commandData);
});

function registerGuild(interaction) {
    staffChannelsMap[interaction.guild.id] = interaction.channel.id;
}

// handle execution of slash commands
client.on('interactionCreate', interaction => {
    // If the interaction isn't a slash command, return
    if (!interaction.isCommand()) return;
  
    // Check if it is the correct command
    if (interaction.commandName === 'register') {
      // Reply to the command
      interaction.reply("Sending request to bot owner to accept...");
      // TODO: set up request system to bot owner to accept said requests
      registerGuild(interaction)
    }
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