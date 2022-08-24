const { SlashCommandBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Function to link Discord account and Minecraft account
 */
module.exports = {
  /**
     * Builds /forcelink [user:GuildMember] [username:string]
     */
  data: new SlashCommandBuilder()
    .setName("forcelink")
    .setDescription("Link your Minecraft account to your Discord")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("user to search")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("username")
        .setDescription("Minecraft username")
        .setRequired(true)
    )
    .setDefaultMemberPermissions("0"),
  async execute(params) {
    const { interaction } = params;
    const discordID = interaction.options.getUser("user").id;
    const username = interaction.options.get("username").value;

    const isVerified = !!(await tokens.db.db("accounts").collection("users").findOne({
      discordID
    }));
    if(!isVerified) {
      await interaction.editReply({
        content: "User is unverified. Unable to link accounts."
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
        content: `That Minecraft account is already linked to a user. Run \`/user minecraft ${username}\` for more information.`
      });
      return;
    }

    tokens.db.db("accounts").collection("users").updateOne({
      discordID,
    }, {
      $push: {
        minecraftUUIDs: minecraftAccount.id
      }
    });

    await interaction.editReply({
      content: "Account has been added."
    });
  },
};