const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.verified = async function verified(message, args) {
    if(!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: User.\nsrc!verified <user>');
    }
    const playerData = await commands.User.getUser(args);
    if(!playerData.data) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'User does not exist.');
    }
    const id = playerData.data.id;
    let data = await commands.Examine.getExamine(id, 0);
    while (data.size == 200){
        data = await commands.Examine.getExamine(id, data.offset + 200);
    }
    const num = data.offset + data.size;
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Result for: ' + args)
        .addField('Number of runs verified: ', num)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}
