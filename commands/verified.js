const commands = require('../api');
const { MessageEmbed } = require('discord.js');
/**
 * Returns the number of runs verified by the user
 * @param {*} message the message to reply to
 * @param {*} args arguments for command
 */
exports.verified = async function verified(message, args) {
    //Return if no user specified
    if(!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: User.\nsrc!verified <user>');
    }
    //Search for user on speedrun.com
    const playerData = await commands.User.getUser(args);
    //If player doesn't exist
    if(!playerData.data) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'User does not exist.');
    }
    //Retrieve runs for game
    const id = playerData.data.id;
    let data = await commands.Examine.getExamine(id, 0);
    //While the pagination.size == 200 keep looping
    while (data.size == 200){
        data = await commands.Examine.getExamine(id, data.offset + 200);
    }
    //Number of runs = the total offset + the current size
    const num = data.offset + data.size;
    //Creates embed
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Result for: ' + args)
        .addField('Number of runs verified: ', num)
    message.channel.send('<@' + message.author.id + '>\n', embed);
}
