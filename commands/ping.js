const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to provide the bot's ping
 */
module.exports = {
    /**
     * Builds /ping
     */
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Provides bot response time."),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(118855)
            .setThumbnail("https://www.speedrun.com/images/1st.png")
            .setTitle(`Ping: ${Date.now() - interaction.createdTimestamp}ms`);
        await interaction.editReply({ embeds: [embed] });
    },
};