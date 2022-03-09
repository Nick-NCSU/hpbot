const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Function to provide a list of categories for the given game
 */
module.exports = {
    /**
     * Builds /categories [string:game]
     */
    data: new SlashCommandBuilder()
        .setName("categories")
        .setDescription("Shows the categories/variables for the provided game.")
        .addStringOption(option =>
            option.setName("game")
                .setDescription("Game to show categories")
                .setRequired(true)
        ),
    async execute(interaction) {
        const game = interaction.options.get("game").value.toLowerCase();
        // Fetches the categories
        const { data } = await tokens.fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}&embed=categories.variables`);
        // Checks if game exists
        if (!data.length) {
            return await interaction.editReply(`No results found for **${game}**.`);
        }
        const [dataArr] = data;
        const embed = new MessageEmbed()
            .setColor("118855")
            .setTitle(dataArr.names.international)
            .setURL(dataArr.weblink)
            .setThumbnail(dataArr.assets["cover-large"].uri);
        // Iterates through all the categories for the game
        let size = 0;
        for (const category of dataArr.categories.data) {
            let variables = "";
            // Checks if variables exist
            if (category.variables.data[0]) {
                let varArr = category.variables.data[0].values.values;
                // Gets alll the variablrd and adds them to the string
                varArr = Object.values(varArr);
                for (let j = 0; j < varArr.length; j++) {
                    variables += varArr[j].label + ", ";
                }
                variables = variables.slice(0, -2);
            } else {
                variables = "None";
            }
            // Category for embed
            const string = "**Category:** " + category.name + "** - id:** " + category.id;
            // Variables for embed
            const string2 = " **Variables:** " + variables + "\n";
            size += string.length + string2.length;
            if(size > 6000) {
                break;
            }
            embed.addField(string, string2);
        }
        return await interaction.editReply({ embeds: [embed] });
    },
};