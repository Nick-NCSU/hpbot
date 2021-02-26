const { MessageEmbed } = require('discord.js');
exports.ping = async function ping(client, message) {
    const embed = new MessageEmbed()
        .setColor('118855')
        .setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
        .setTitle(`Ping: ${Math.round(client.ws.ping)}ms`)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}