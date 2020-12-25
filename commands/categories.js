const { MessageEmbed } = require('discord.js');
const commands = require('../api');
/**
 * Function to provide a list of categories for the given game
 */
exports.categories = async function categories(message, args) {
    // Checks if game is provided
    if (!args[0]) {
        return message.channel.send('<@' + message.author.id + '>\n' + 'src!categories <game>');
    }
    const game = args[0];
    const { data } = await commands.Categories.getCategories(args.shift());
    // Checks if game exists
    if (!data.length) {
        return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    const [dataArr] = data;
    const category = [];
    // Iterates through all the categories for the game
    for (let i = 0; i < dataArr.categories.data.length; i++) {
        category[i] = [];
        category[i][0] = dataArr.categories.data[i].name;
        if (dataArr.categories.data[i].variables.data[0]) {
            let varArr = dataArr.categories.data[i].variables.data[0].values.values;
            varArr = Object.values(varArr);
            for (let j = 0; j < varArr.length; j++) {
                category[i][j + 1] = varArr[j].label;
            }
        }
    }
    let name1, name3;
    let name2 = '';
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle(dataArr.names.international)
        .setURL(dataArr.weblink)
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
    for (let k = 0; k < category.length; k++) {
        name1 = category[k][0];
        if (dataArr.categories.data[k].variables.data[0]) {
            name3 = dataArr.categories.data[k].variables.data[0].id;
        }
        else {
            name3 = 'None';
        }
        for (let m = 0; m < category[k].length - 1; m++) {
            name2 += category[k][m + 1];
            if (m < category[k].length - 2) {
                name2 += ', ';
            }
        }
        if (!name2) {
            name2 = 'None';
        }
        embed.addField('**Category:** ' + name1 + '** - id:** ' + name3, ' **Variables:** ' + name2 + '\n');
        name2 = '';
    }
    message.channel.send('<@' + message.author.id + '>\n', embed);
}