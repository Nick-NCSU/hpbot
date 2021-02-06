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
    if(firstPage.data.length > 0) {
        embed.setColor('118855')
        embed.setTitle('Result for: ' + args)
        embed.addField('Number of unverified runs: ', num)
        embed.addField('Oldest unverified run: ', firstPage.data[0].date)
    } else {
        embed.setColor('118855')
        embed.setTitle('Result for: ' + args)
        embed.addField('Number of unverified runs: ', num)
    }
    message.channel.send('<@' + message.author.id + '>\n', embed);
}
