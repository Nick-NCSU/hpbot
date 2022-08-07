const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Returns the number of runs verified by the user
 */
module.exports = {
    /**
     * Builds /verified [string:user]
     */
    data: new SlashCommandBuilder()
        .setName("verified")
        .setDescription("Provides the number of runs verified by the given user.")
        .addStringOption(option =>
            option.setName("user")
                .setDescription("User to search")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.get("user").value.toLowerCase();
        // Search for user on speedrun.com
        const playerData = await tokens.fetch(`https://www.speedrun.com/api/v1/users/${user}`);
        // If player doesn't exist
        if(!playerData.data) {
            return await interaction.editReply("User does not exist.");
        }
        // Retrieve runs for game
        const id = playerData.data.id;
        let data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?examiner=${id}&max=200`);
        // While the pagination.size == 200 keep looping
        while (data.pagination.size == 200 && data.pagination.offset != 9800){
            data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?examiner=${id}&max=200&offset=${data.pagination.offset + 200}`);
        }
        // Number of runs = the total offset + the current size
        const num = data.pagination.offset + data.pagination.size;
        // Creates embed
        const embed = new EmbedBuilder()
            .setColor("#118855")
            .setTitle("Result for: " + user)
            .addFields([
                {name: "Number of runs verified: ", value: num >= 10000 ? ">= 10k" : String(num) }
            ])
            .setThumbnail(playerData.data.assets.image.uri);
        return await interaction.editReply({ embeds: [embed] });
    },
};