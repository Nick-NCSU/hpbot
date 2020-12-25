const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.wr = async function wr(message, args) {
    if (!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Game.\nsrc!wr <game> <category> (variable)');
    }
    if (!args[1]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Category.\nsrc!wr <game> <category> (variable)');
    }
    const game = args[0];
    const category = args[1];
    const {data} = await commands.Wr.getWr(args);
    if (!data) {
        return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    const dataArr = data;
    const runLength = new Date(dataArr.runs[0].run.times.primary_t * 1000).toISOString().slice(11, -1);
    const links = dataArr.runs[0].run.videos ? dataArr.runs[0].run.videos.links[0].uri : 'No Link Provided';
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('World Record for ' + game + ': ' + category)
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .addField('Time', runLength)
        .addField('WR Holder', await players(dataArr.runs[0].run.players))
        .addField('Run Link', dataArr.runs[0].run.weblink)
        .addField('Run Video Link', links)
        .addField('Description', dataArr.runs[0].run.comment)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}