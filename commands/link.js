const commands = require('../api');
const { MessageEmbed } = require('discord.js');
/**
 * Function to provide a link to the given game
 */
exports.link = async function link(message, args) {
    // Checks if game is provided
    if (!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'src!link <game>');
    }
    const game = args[0];
    const {data} = await commands.Link.getLink(args);
    [answer] = data;
    // Checks if game exists
    if (!answer || answer.length == 0) {
        return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    // Embed to return
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle(answer.names.international)
        .setURL(answer.weblink)
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}