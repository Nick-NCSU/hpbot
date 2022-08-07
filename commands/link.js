const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Function to provide a link to the given game
 */
module.exports = {
    /**
     * Builds /link [string:game]
     */
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Sends a link to the provided game.")
        .addStringOption(option =>
            option.setName("game")
                .setDescription("Game to link")
                .setRequired(true)
        ),
    async execute(interaction) {
        const game = interaction.options.get("game").value.toLowerCase();
        // Gets the requested game
        const {data} = await tokens.fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}`);
        const [answer] = data;
        // Checks if game exists
        if (!answer || answer.length == 0) {
            return await interaction.editReply(`No results found for **${game}**.`);
        }
        // Embed to return
        const embed = new EmbedBuilder()
            .setColor(118855)
            .setTitle(answer.names.international)
            .setURL(answer.weblink)
            .setThumbnail(answer.assets["cover-large"].uri);
        await interaction.editReply({ embeds: [embed] });
    },
};