const commands = require('../api');
const { MessageEmbed } = require('discord.js');
const { now } = require('perf_hooks').performance;
exports.dream = async function dream(message, args) {
    const time1 = now();
    let num = 0;
    for(let i = 0; i < 263; i++) {
        if(Math.random() <= (20/423)) {
            num++;
        }
    }
    let num2 = 0;
    for(let i = 0; i < 306; i++) {
        if(Math.random() * 100 <= 50) {
            num2++;
        }
    }
    const difference = num >= 42 ? '+' + num - 42 : num - 42;
    const difference2 = num2 >= 211 ? '+' + num2 - 211 : num2 - 211;
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Your Results:')
        .addField('Number of pearl trades: ' + num + '/262', 'Number of pearl trades (Dream): 42/262')
        .addField('Number of rods: ' + num2 + '/305', 'Number of rods (Dream): 211/305')
        .setFooter('Difference: ' + difference + '/' + difference2)
        if(args == 'true') {
            embed.addField('Time Taken:', (now() - time1) + 'ms')
        }
    message.channel.send('<@' + message.author.id + '>\n', embed);
}