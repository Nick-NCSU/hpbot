const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.unverified = async function unverified(message, args) {
    if(!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: User.\nsrc!unverified <game>');
    }
    const gameData = await commands.Game.getGame(args);
    if(!gameData.data) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Game does not exist.');
    }
    const id = gameData.data.id;
    let data = await commands.New.getUnexamine(id, 0);
    while (data.pagination.size == 200){
        data = await commands.New.getUnexamine(id, data.pagination.offset + 200);
    }
    const num = data.pagination.offset + data.pagination.size;
    const firstPage = await commands.New.getUnexamine(id, 0);
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Result for: ' + args)
        .addField('Number of unverified runs: ', num)
        .addField('Oldest unverified run: ', firstPage.data[0].date)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}
