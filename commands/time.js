const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.time = async function time(message, args) {
    if (!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Game.\nsrc!time <game> <category> <place> (variable)');
    }
    if (!args[1]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Category.\nsrc!time <game> <category> <place> (variable)');
    }
    if (!args[2]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Place.\nsrc!time <game> <category> <place> (variable)');
    }
    const game = args[0];
    const category = args[1];
    const place = args[2];
    const { data } = await commands.Time.getTime(args);
    if (!data) {
        return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    const dataArr = data;
    const runLength = new Date(dataArr.runs[place - 1].run.times.primary_t * 1000).toISOString().slice(11, -1);
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Result for ' + game + ': ' + category)
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .addField('Time', runLength)
        .addField('Runner(s)', await players(dataArr.runs[place - 1].run.players))
        .addField('Run Link', dataArr.runs[place - 1].run.weblink)
        .addField('Run Video Link', dataArr.runs[place - 1].run.videos.links[0].uri)
        .addField('Description', dataArr.runs[place - 1].run.comment)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}
