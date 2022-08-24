const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const tokens = require("../index.js");

/**
 * Function to find user by Discord, Speedrun.com username, or Minecraft username
 */
module.exports = {
  /**
     * Builds /user discord [user:GuildMember]
     *        /user minecraft [ign:string]
     *        /user src [username:string]
     */
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Link your Minecraft account to your Discord")
    .addSubcommand(subcommand => 
      subcommand.setName("discord")
        .setDescription("Find a user by Discord")
        .addUserOption(option => 
          option.setName("user")
            .setDescription("user to search")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand.setName("minecraft")
        .setDescription("Find a user by Minecraft ign")
        .addStringOption(option =>
          option.setName("ign")
            .setDescription("ign to search")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand.setName("src")
        .setDescription("Find a user by Speedrun.com username")
        .addStringOption(option =>
          option.setName("username")
            .setDescription("username to search")
            .setRequired(true)
        )
    ),
  async execute(params) {
    const { interaction } = params;
    const discordID = interaction.options.getUser("user")?.id;
    const srcUsername = interaction.options.getString("username");
    const minecraftUsername = interaction.options.getString("ign");

    let document;
    const data = {
      discordID: "",
      username: "",
      icon: "",
      accounts: [],
    };
    if(discordID) {
      data.discordID = discordID;
      document = await tokens.db.db("accounts").collection("users").findOne({
        discordID
      });
    } else if(srcUsername) {
      const srcAccount = await tokens.fetch(`https://www.speedrun.com/api/v1/users/${srcUsername}`);
      if(!srcAccount.data) {
        interaction.editReply({
          content: `User ${srcUsername} not found.`
        });
        return;
      }
      data.username = srcUsername;
      data.icon = srcAccount.data.assets.image.uri;
      document = await tokens.db.db("accounts").collection("users").findOne({
        srcID: srcAccount.data.id
      });
    } else if(minecraftUsername) {
      const minecraftAccount = await tokens.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${minecraftUsername}`);
      if(!minecraftAccount) {
        await interaction.editReply("Player does not exist");
        return;
      }
      if(!minecraftAccount.id) {
        await interaction.editReply("Error getting UUID");
        return;
      }
      document = await tokens.db.db("accounts").collection("users").findOne({
        minecraftUUIDs: minecraftAccount.id
      });
    }

    if(!document) {
      interaction.editReply({
        content: "User is unverified or unlinked."
      });
      return;
    }

    if(!data.username) {
      const srcAccount = await tokens.fetch(`https://www.speedrun.com/api/v1/users/${document.srcID}`);
      if(!srcAccount.data) {
        interaction.editReply({
          content: `User id ${document.srcID} not found.`
        });
        return;
      }
      data.username = srcAccount.data.names.international;
      data.icon = srcAccount.data.assets.image.uri;
    }
    if(!data.discordID) {
      data.discordID = document.discordID;
    }
    for(const uuid of document.minecraftUUIDs) {
      const player = await tokens.fetchMojang(`https://api.mojang.com/user/profiles/${uuid}/names`);
      data.accounts.push({
        uuid,
        ign: player[player.length - 1].name
      });
    }
    let date = new Date().toISOString().slice(0, 10);
    let embed = new EmbedBuilder()
      .setColor("#118855")
      .setTitle("Found User")
      .setThumbnail(data.icon)
      .setFooter({ text: `${date}` })
      .addFields([
        { name: "Discord:", value: `<@${data.discordID}>`},
        { name: "Speedrun.com account:", value: `[${data.username}](https://www.speedrun.com/user/${data.username})`},
        ...data.accounts.map((account) => {
          return { name: account.ign, value: `[Stats](https://sk1er.club/s/${account.uuid}) | [NameMC](https://namemc.com/profile/${account.uuid})`};
        })
      ]);
    await interaction.editReply({ embeds: [embed] });
  },
};