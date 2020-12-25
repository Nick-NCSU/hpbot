const { MessageEmbed } = require('discord.js');
exports.help = function help(message) {
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Help')
        .setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
        .addField('src!help', 'Shows this help message.')
        .addField('src!link <game>', 'Sends a link to the provided game.')
        .addField('src!categories|c <game>', 'Shows the categories/variables for the provided game.')
        .addField('src!search|s <keyword> (page)', 'Searches for games containing the keyword(s).')
        .addField('src!wr <game> <category> (variable)', 'Tells you the WR for the provided game and category. (Only supports one variable currently)')
        .addField('src!time <game> <category> <place> (variable)', 'Tells you the info for the provided game, category, and place. (Only supports one variable currently)')
        .addField('src!lb <game>', 'Provides a leaderboard for the given game.')
        .addField('src!verified|v <user>', 'Provides the number of runs verified by the given user.')
        .addField('src!unverified|uv <game>', 'Provides the number of unverified runs for the given game.')
    message.channel.send('<@' + message.author.id + '>\n', embed);
}