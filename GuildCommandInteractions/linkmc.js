const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Function to link Discord account and Minecraft account
 */
module.exports = {
  /**
     * Builds /linkmc [username:string]
     */
  data: new SlashCommandBuilder()
    .setName("linkmc")
    .setDescription("Link your Minecraft account to your Discord")
    .addStringOption(option =>
      option.setName("username")
        .setDescription("Minecraft username")
        .setRequired(true)
    ),
  async execute(params) {
    const { interaction } = params;
    const username = interaction.options.get("username").value;

    const isVerified = !!(await tokens.db.db("accounts").collection("users").findOne({
      discordID: interaction.user.id
    }));
    if(!isVerified) {
      await interaction.editReply({
        content: "You need to link your Discord and speedrun.com accounts first. Please run `/verify <speedrun.com username>`."
      });
      return;
    }

    const minecraftAccount = await tokens.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if(!minecraftAccount) {
      await interaction.editReply("Player does not exist");
      return;
    }
    if(!minecraftAccount.id) {
      await interaction.editReply("Error getting UUID");
      return;
    }

    const isLinked = !!(await tokens.db.db("accounts").collection("users").findOne({
      minecraftUUIDs: minecraftAccount.id
    }));
    if(isLinked) {
      await interaction.editReply({
        content: "That Minecraft account is already linked. Please contact <@168420049462362112> if this is a mistake."
      });
      return;
    }

    const hypixelAccount = await tokens.fetchHypixel(`https://api.hypixel.net/player?uuid=${minecraftAccount.id}&key=${tokens.hypixel}`);
    if(hypixelAccount?.player?.socialMedia?.links?.DISCORD.toLowerCase() !== interaction.user.tag.toLowerCase()) {
      await interaction.editReply("Please link your Discord account to Hypixel. Type `/profile` in game > Select \"Social Media\" > Select \"Discord\" and add your profile > Log off of Hypixel to update your player. If you are still unable to link your accounts, please contact discord server staff.");
      return;
    }

    tokens.db.db("accounts").collection("users").updateOne({
      discordID: interaction.user.id,
    }, {
      $push: {
        minecraftUUIDs: minecraftAccount.id
      }
    });

    await interaction.editReply({
      content: "Your account has been added."
    });
  },
};