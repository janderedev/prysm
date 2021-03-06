const { SlashCommand } = require('../../bot/slashCommands');
const { InteractionResponseType: resType } = require('discord-interactions');
const { client } = require('../../../bot');

/**
 * 
 * @param {SlashCommand} cmd
 * @param {function(String, import('discord.js').MessageEmbed | false, resType, boolean) : void} callback
 */
module.exports.execute = async (cmd, callback) => {
    try {
        const guild = await client.guilds.fetch(cmd.guild_id);
        if (!guild) return;
        const channel = guild.channels.cache.get(cmd.channel_id);

        if (!channel.permissionsFor(guild.me).has('MANAGE_WEBHOOKS'))
            return callback('I need permission to \`Manage Webhooks\` for this command to work.', false, resType.CHANNEL_MESSAGE, true);
        
        let hook = (await channel.fetchWebhooks()).array().filter(h => h.type == 'Incoming');
        if (hook.length == 0) hook = await channel.createWebhook('Prysm', { avatar: client.user.avatarURL() });
        else hook = hook[0];
        const member = await guild.members.fetch(cmd.data.options.filter(option => option.name == 'user')[0].value);
        hook.send(cmd.data.options.filter(option => option.name == 'body')[0].value, {
                avatarURL: member.user.displayAvatarURL({ dynamic: true }),
                username: member.displayName
            })
            .catch(e => {
                console.error(e);
                callback(`An error has occurred: ${e}`, false, resType.CHANNEL_MESSAGE, true);
            });
        callback(false);
    } catch(e) {
        console.error(e);
    }
}

module.exports.sendConfirmation = 'callback';
module.exports.requireGuildMember = true;