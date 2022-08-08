const tokens = require("../index.js");

/**
 * Returns options depending on previously selected option
 */
module.exports = {
    data: 'reject',
    async execute(params) {
        const { interaction } = params;
        interaction.message.embeds[0].fields.push({ name: 'Rejected by:', value: `<@${interaction.user.id}>`})
        await interaction.update({
            embeds: interaction.message.embeds,
            components: []
        })
    },
};