const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to provide help for slash commands.
 */
module.exports = {
    /**
     * Builds /help
     */
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Provides a list of commands and descriptions."),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(118855)
            .setTitle("Help")
            .setThumbnail("https://www.speedrun.com/images/1st.png")
            .addFields([
                { name: "/help", value: "Shows this help message." },
                { name: "/hypixel", value: "Provides helpful links for Hypixel Speedruns" },
                { name: "/link <game>", value: "Sends a link to the provided game." },
                { name: "/categories <game>", value: "Shows the categories/variables for the provided game." },
                { name: "/search <keyword> (page)", value: "Searches for games containing the keyword(s)." },
                { name: "/leaderboard <game>", value: "Provides a leaderboard for the given game." },
                { name: "/verified <user>", value: "Provides the number of runs verified by the given user." },
                { name: "/queuelength <game>", value: "Provides the number of unverified runs for the given game." },
                { name: "/dream (simulations)", value: "Simulates Dream's pearl and blaze rod odds." },
                { name: "/ping", value: "Provides bot response time." }
            ])
        await interaction.editReply("Sending you help!");
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    },
};