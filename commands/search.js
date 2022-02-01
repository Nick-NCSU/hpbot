const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tokens = require('../index.js')

/**
 * Function to search for a specified game
 */
module.exports = {
    /**
     * Builds /search [string:query] (integer:page)
     */
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Searches for games containing the keyword(s).')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Which page would you like to view?')
        ),
	async execute(interaction) {
        const search = interaction.options.get('query').value.toLowerCase();
        let page = interaction.options.get('page');
        // If page is not specified default to 1
        if(!page) {
            page = 1;
        } else {
            page = page.value;
        }
        let offset = (page - 1) * 20;
        // Fetch games at the given page
        const { data } = await tokens.fetch(`https://www.speedrun.com/api/v1/games?name=${search}&offset=${offset}`);
        if (!data.length) {
            return interaction.editReply(`No results found for **${search}**.`)
        }
        const answer = [];
        // Iterates through each game and gets the name and url
        for (let i = 0; i < data.length; i++) {
            answer[i] = [];
            answer[i][0] = data[i].names.international;
            answer[i][1] = data[i].abbreviation + '\n' + data[i].weblink;
        }
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Results (Count: ' + answer.length + ', Page: ' + page + ')')
            .setThumbnail('https://www.speedrun.com/images/1st.png')
        answer.forEach(entry => {
            embed.addField(entry[0], entry[1]);
        });
        if (answer.length == 20) {
            embed.setFooter('There may be more pages. Use /search <game> <page>')
        }
        return await interaction.editReply({ embeds: [embed] });
	},
};