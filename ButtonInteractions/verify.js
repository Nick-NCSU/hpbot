const tokens = require("../index.js");

/**
 * Returns options depending on previously selected option
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
        interaction.message.embeds[0].fields.push({ name: "Verified by:", value: `<@${interaction.user.id}>`});
        await interaction.update({
            embeds: interaction.message.embeds,
            components: []
        });
    },
};