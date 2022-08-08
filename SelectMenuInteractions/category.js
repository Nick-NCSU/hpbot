const { ActionRowBuilder, SelectMenuBuilder } = require("discord.js");

/**
 * Returns options depending on previously selected option
 */
module.exports = {
    data: "category",
    async execute(params) {
        const { interaction } = params;
        let options = {
            "General": [
                {
                    label: "Hypixel Speedruns Discord",
                    description: "Hypixel Speedruns Discord Link",
                    value: "Hypixel Speedruns Discord",
                },
                {
                    label: "Hypixel Server Parkour Discord",
                    description: "Hypixel Server Parkour Discord Link",
                    value: "Hypixel Server Parkour Discord",
                },
                {
                    label: "Hypixel SkyBlock Speedruns Discord",
                    description: "Hypixel SkyBlock Speedruns Discord Link",
                    value: "Hypixel SkyBlock Speedruns Discord",
                },
                {
                    label: "Series",
                    description: "Hypixel Series Link",
                    value: "Series",
                },
                {
                    label: "Twitter",
                    description: "Hypixel Speedruns Twitter",
                    value: "Twitter",
                },
            ],
            "Games": [
                {
                    label: "SkyWars",
                    value: "SkyWars",
                },
                {
                    label: "BedWars",
                    value: "BedWars",
                },
                {
                    label: "Category Extensions",
                    value: "Category Extensions",
                },
                {
                    label: "Arcade Games",
                    value: "Arcade Games",
                },
                {
                    label: "Classic Games",
                    value: "Classic Games",
                },
                {
                    label: "SMP",
                    value: "SMP",
                },
                {
                    label: "The Pit",
                    value: "The Pit",
                },
                {
                    label: "Server Parkour",
                    value: "Server Parkour",
                },
            ],
            "Maps": [
                {
                    label: "Zombie Apocalypse",
                    value: "Zombie Apocalypse",
                },
                {
                    label: "Wrath of the Fallen",
                    value: "Wrath of the Fallen",
                },
                {
                    label: "Herobrine's Mansion",
                    value: "Herobrine's Mansion",
                },
                {
                    label: "Herobrine's Return",
                    value: "Herobrine's Return",
                },
                {
                    label: "Minecraft Star Wars",
                    value: "Minecraft Star Wars",
                },
                {
                    label: "Creeper Dungeon",
                    value: "Creeper Dungeon",
                },
            ],
            "Speedrun.com": [
                {
                    label: "Support Hub",
                    description: "Speedrun.com support",
                    value: "Support Hub",
                },
                {
                    label: "Knowledge Base",
                    description: "Speedrun.com general site information",
                    value: "Knowledge Base",
                },
                {
                    label: "Speedrun.com Discord",
                    description: "Speedrun.com general Discord",
                    value: "Speedrun.com Discord",
                },
                {
                    label: "Graphic Assets",
                    description: "Speedrun.com Assets",
                    value: "Graphic Assets",
                },
                {
                    label: "Speedrun.com Twitter",
                    description: "Speedrun.com general Twitter",
                    value: "Speedrun.com Twitter",
                },
            ]
        }[interaction.values[0]];
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId("link")
                    .setPlaceholder("Nothing selected")
                    .addOptions(options),
            );
        return await interaction.update({ content: "Please select a link!", components: [row] });
    },
};