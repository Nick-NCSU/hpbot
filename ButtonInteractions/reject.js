/**
 * Rejects a speedrun.com Discord connection
 */
module.exports = {
    data: "reject",
    async execute(params) {
        const { interaction } = params;
        interaction.message.embeds[0].fields.push({ name: "Rejected by:", value: `<@${interaction.user.id}>`});
        await interaction.update({
            embeds: interaction.message.embeds,
            components: []
        });
    },
};