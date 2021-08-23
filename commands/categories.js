const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const commands = require('../api');

/**
 * Function to provide a list of categories for the given game
 */


module.exports = {
    data: new SlashCommandBuilder()
        .setName('categories')
        .setDescription('Shows the categories/variables for the provided game.')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to show categories')
                .setRequired(true)
        ),
	async execute(interaction) {
        const game = interaction.options.get('game').value.toLowerCase();
        const { data } = await commands.Categories.getCategories(game);
        // Checks if game exists
        if (!data.length) {
            return await interaction.editReply(`No results found for **${game}**.`);
        }
        const [dataArr] = data;
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle(dataArr.names.international)
            .setURL(dataArr.weblink)
            .setThumbnail(dataArr.assets["cover-large"].uri)
        // Iterates through all the categories for the game
        for (const category of dataArr.categories.data) {
            let variables = '';
            if (category.variables.data[0]) {
                let varArr = category.variables.data[0].values.values;
                varArr = Object.values(varArr);
                for (let j = 0; j < varArr.length; j++) {
                    variables += varArr[j].label + ', ';
                }
                variables = variables.slice(0, -2);
            } else {
                variables = 'None';
            }
            embed.addField('**Category:** ' + category.name + '** - id:** ' + category.id, ' **Variables:** ' + variables + '\n');
        }
        return await interaction.editReply({ embeds: [embed] });
	},
};