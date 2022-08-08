const { ActionRowBuilder, SelectMenuBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to provide a link to a requested site
 */
module.exports = {
    /**
     * Builds /hypixel
     */
    data: new SlashCommandBuilder()
        .setName("hypixel")
        .setDescription("Provides helpful links for Hypixel Speedruns"),
    async execute(params) {
        const { interaction } = params;
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId("category")
                    .setPlaceholder("Nothing selected")
                    .addOptions([
                        {
                            label: "General",
                            description: "Get links to general Hypixel Speedruns Information",
                            value: "General",
                        },
                        {
                            label: "Games",
                            description: "Get links to Hypixel Speedrun Games",
                            value: "Games",
                        },
                        {
                            label: "Maps",
                            description: "Get links to Hypixel Speedrun Maps",
                            value: "Maps",
                        },
                        {
                            label: "Speedrun.com",
                            description: "Links to speedrun.com resources",
                            value: "Speedrun.com",
                        },
                    ]),
            );         
        return await interaction.editReply({ content: "Please select a category!", components: [row] });
    },
};