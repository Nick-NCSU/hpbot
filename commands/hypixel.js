const { ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, InteractionType } = require("discord.js");
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
    async execute(interaction) {
        // Initial running of the command
        if(interaction.type === InteractionType.ApplicationCommand) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId("type")
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
        } else if (interaction.isSelectMenu()) {
            // Second menu
            if(interaction.customId == "type") {
                let options = "";
                switch(interaction.values[0]) {
                case "General":
                    options = [
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
                    ];
                    break;
                case "Games":
                    options = [
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
                    ];
                    break;
                case "Maps":
                    options = [
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
                    ];
                    break;
                case "Speedrun.com":
                    options = [
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
                    ];
                    break;
                }
                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("link")
                            .setPlaceholder("Nothing selected")
                            .addOptions(options),
                    );         
                return await interaction.update({ content: "Please select a link!", components: [row] });
            } else if(interaction.customId == "link") {
                // Third menu
                let url;
                switch(interaction.values[0]) {
                case "Hypixel Speedruns Discord":
                    url = "https://discord.gg/HhNKdB9FJk";
                    break;
                case "Hypixel Server Parkour Discord":
                    url = "https://discord.gg/RJTk7Bv";
                    break;
                case "Hypixel SkyBlock Speedruns Discord":
                    url = "https://discord.gg/vskJtfR";
                    break;
                case "Series":
                    url = "https://www.speedrun.com/hypixel";
                    break;
                case "Twitter":
                    url = "https://twitter.com/HSpeedrunning";
                    break;
                case "SkyWars":
                    url = "https://www.speedrun.com/hypixel_sw";
                    break;
                case "BedWars":
                    url = "https://www.speedrun.com/hypixel_bw";
                    break;
                case "Category Extensions":
                    url = "https://www.speedrun.com/hypixel_ce";
                    break;
                case "Arcade Games":
                    url = "https://www.speedrun.com/hypixel_ag";
                    break;
                case "Classic Games":
                    url = "https://www.speedrun.com/hypixel_cg";
                    break;
                case "SMP":
                    url = "https://www.speedrun.com/hypixel_smp";
                    break;
                case "The Pit":
                    url = "https://www.speedrun.com/hypixel_tp";
                    break;
                case "Server Parkour":
                    url = "https://www.speedrun.com/mcm_hsp";
                    break;
                case "Zombie Apocalypse":
                    url = "https://www.speedrun.com/mcm_za";
                    break;
                case "Wrath of the Fallen":
                    url = "https://www.speedrun.com/mcm_wotf";
                    break;
                case "Herobrine's Mansion":
                    url = "https://www.speedrun.com/mcm_hm";
                    break;
                case "Herobrine's Return":
                    url = "https://www.speedrun.com/mcm_hr";
                    break;
                case "Minecraft Star Wars":
                    url = "https://www.speedrun.com/mcm_sw";
                    break;
                case "Creeper Dungeon":
                    url = "https://www.speedrun.com/mcm_cd";
                    break;
                case "Support Hub":
                    url = "https://www.speedrun.com/knowledgebase/supporthub";
                    break;
                case "Knowledge Base":
                    url = "https://www.speedrun.com/knowledgebase";
                    break;
                case "Speedrun.com Discord":
                    url = "https://discord.gg/0h6sul1ZwHVpXJmK";
                    break;
                case "Graphic Assets":
                    url = "https://www.speedrun.com/knowledgebase/graphic-assets";
                    break;
                case "Speedrun.com Twitter":
                    url = "https://twitter.com/speedruncom";
                    break;
                }
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel(interaction.values[0])
                            .setStyle("LINK")
                            .setURL(url),
                    );
                await interaction.update({ content: interaction.values[0] + " Link:", components: [row] });
            }
        }
    },
};