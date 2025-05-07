const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to create a suggestion
 */
module.exports = {
  /**
     * Builds /suggest [title:string] [description:string]
     */
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Create a suggestion")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Title of the suggestion (max 256 characters).")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Description of the suggestion (max 4096 characters).")
        .setRequired(true)
    ),
  async execute(params) {
    const { interaction, client } = params;
    const channel = await client.channels.cache.get("1005944361709731981");
    const title = interaction.options.get("title").value;
    const description = interaction.options.get("description").value;
        
    let date = new Date().toISOString().slice(0, 10);
    let embed = new EmbedBuilder()
      .setColor("#118855")
      .setTitle(title.slice(0, 256))
      .setFooter({ text: `${date}` })
      .setDescription(description.slice(0, 4096))
      .addFields([
        { name: "Submitted by:", value: `<@${interaction.user.id}>`}
      ]);
    let message = await channel.send({ embeds: [embed] });
    message.react("👍");
    message.react("👎");
    message.startThread({
      name: title.slice(0, 64),
    });
    await interaction.editReply({
      content: "Suggestion has been created: " + message.url
    });
  },
};