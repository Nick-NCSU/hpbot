const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.search = async function search(message, args) {
    if (!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'src!search <game>');
    }
    const game = args[0];
    const { data } = await commands.Search.getSearch(args);
    if (!data.length) {
        return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    const answer = [];
    for (let i = 0; i < data.length; i++) {
        answer[i] = [];
        answer[i][0] = data[i].names.international;
        answer[i][1] = data[i].abbreviation;
    }
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Results (' + answer.length + ')')
        .setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
    answer.forEach(entry => {
        embed.addField(entry[0], entry[1]);
    });
    if (answer.length == 20) {
        embed.setFooter('There may be more pages. Use src!search <game> <page>')
    }
    message.channel.send('<@' + message.author.id + '>\n', embed);
}