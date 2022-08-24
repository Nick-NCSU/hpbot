const tokens = require("../index.js");

/**
 * Verifys a speedrun.com Discord connection
 */
module.exports = {
  data: "verify",
  async execute(params) {
    const { interaction } = params;
    const {discordID, srcID} = JSON.parse(interaction.customId);
    tokens.db.db("accounts").collection("users").insertOne({
      discordID,
      srcID,
      minecraftUUIDs: [],
    });
    await interaction.guild.members.cache.get(discordID).roles.add("1006010384064458763");
    interaction.message.embeds[0].fields.push({ name: "Verified by:", value: `<@${interaction.user.id}>`});
    await interaction.update({
      embeds: interaction.message.embeds,
      components: []
    });
  },
};