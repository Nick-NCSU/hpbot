const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Function to provide a list of unverified runs in the queue for a game
 */
module.exports = {
    /**
     * Builds /queuelength [string:game]
     */
    data: new SlashCommandBuilder()
        .setName("queuelength")
        .setDescription("Provides the number of unverified runs for the given game.")
        .addStringOption(option =>
            option.setName("game")
                .setDescription("Game to search")
                .setRequired(true)
        ),
    async execute(interaction) {
        const game = interaction.options.get("game").value.toLowerCase();
        // Gets the game for the id
        const gameData = await tokens.fetch(`https://www.speedrun.com/api/v1/games/${game}`);
        if(!gameData.data) {
            return await interaction.editReply("Game does not exist.");
        }
        // Gets the first page of unverified runs
        const id = gameData.data.id;
        let data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?game=${id}&status=new&max=200&orderby=submitted&direction=asc`);
        const firstPage = data.data[0];
        // Keeps requesting until no more runs exist
        while (data.pagination.size == 200){
            data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?game=${id}&status=new&max=200&orderby=submitted&direction=asc&offset=${data.pagination.offset + 200}`);
        }
        const num = data.pagination.offset + data.pagination.size;
        const embed = new MessageEmbed()
            .setColor("118855")
            .setTitle("Result for: " + game)
            .setThumbnail(gameData.data.assets["cover-large"].uri);
        if(firstPage) {
            embed.addField("Number of unverified runs: ", String(num))
                .addField("Oldest unverified run: ", firstPage.submitted.substring(0,10));
        } else {
            embed.addField("Number of unverified runs: ", String(num));
        }
        await interaction.editReply({ embeds: [embed] });
    },
};