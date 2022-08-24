const { ActionRowBuilder,  ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Returns links for /hypixel
 */
module.exports = {
  data: "link",
  async execute(params) {
    const { interaction } = params;
    const url = {
      "Hypixel Speedruns Discord": "https://discord.gg/HhNKdB9FJk",
      "Hypixel Server Parkour Discord": "https://discord.gg/RJTk7Bv",
      "Hypixel SkyBlock Speedruns Discord": "https://discord.gg/vskJtfR",
      "Series": "https://www.speedrun.com/hypixel",
      "Twitter": "https://twitter.com/HSpeedrunning",
      "SkyWars": "https://www.speedrun.com/hypixel_sw",
      "BedWars": "https://www.speedrun.com/hypixel_bw",
      "Category Extensions": "https://www.speedrun.com/hypixel_ce",
      "Arcade Games": "https://www.speedrun.com/hypixel_ag",
      "Classic Games": "https://www.speedrun.com/hypixel_cg",
      "SMP": "https://www.speedrun.com/hypixel_smp",
      "The Pit": "https://www.speedrun.com/hypixel_tp",
      "Server Parkour": "https://www.speedrun.com/mcm_hsp",
      "Zombie Apocalypse": "https://www.speedrun.com/mcm_za",
      "Wrath of the Fallen": "https://www.speedrun.com/mcm_wotf",
      "Herobrine's Mansion": "https://www.speedrun.com/mcm_hm",
      "Herobrine's Return": "https://www.speedrun.com/mcm_hr",
      "Minecraft Star Wars": "https://www.speedrun.com/mcm_sw",
      "Creeper Dungeon": "https://www.speedrun.com/mcm_cd",
      "Support Hub": "https://www.speedrun.com/knowledgebase/supporthub",
      "Knowledge Base": "https://www.speedrun.com/knowledgebase",
      "Speedrun.com Discord": "https://discord.gg/0h6sul1ZwHVpXJmK",
      "Graphic Assets": "https://www.speedrun.com/knowledgebase/graphic-assets",
      "Speedrun.com Twitter": "https://twitter.com/speedruncom",
    }[interaction.values[0]];
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(interaction.values[0])
          .setStyle(ButtonStyle.Link)
          .setURL(url),
      );
    await interaction.update({ content: interaction.values[0] + " Link:", components: [row] });
  },
};