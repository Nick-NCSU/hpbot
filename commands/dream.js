const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.dream = async function dream(message, args) {
    let num = 0;
    for(let i = 0; i < 263; i++) {
        if(Math.random() <= (20/423)) {
            num++;
        }
    }
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Number of pearl trades: ' + num + '/262')
        .setFooter('Number of pearl trades (Dream): 42/262')

    num = 0;
    for(let i = 0; i < 306; i++) {
        if(Math.random() * 100 <= 50) {
            num++;
        }
    }
    const embed2 = new MessageEmbed()
        .setColor('118855')
        .setTitle('Number of rods: ' + num + '/305')
        .setFooter('Number of rods (Dream): 211/305')
    message.channel.send('<@' + message.author.id + '>\n', embed);
    message.channel.send(embed2);
}