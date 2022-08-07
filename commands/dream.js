const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to provide a simulation of Dream's pearl/blaze rod odds.
 */
module.exports = {
    /**
     * Builds /categories (integer:simulations)
     */
    data: new SlashCommandBuilder()
        .setName("dream")
        .setDescription("Simulates Dream's pearl and blaze rod odds.")
        .addIntegerOption(option =>
            option.setName("simulations")
                .setDescription("Number of simulations to run (Max 100,000")
        ),
    async execute(params) {
        const { interaction } = params;
        let sim = interaction.options.get("simulations");
        // If the number of simulations was not specified then set sim to 1
        if(!sim) {
            sim = 1;
        } else {
            sim = sim.value;
        }
        if(sim > 100000) {
            return await interaction.editReply("Too many simulations (" + sim + ")");
        }
        // Max pearls
        let pMax = 0;
        // Max rods
        let rMax = 0;
        // Total pearls
        let pTotal = 0;
        // Total rods
        let rTotal = 0;
        // Runs the simulations
        for(let count = 0; count < sim; count++) {
            let pCount = 0;
            // Increments the number of pearls with 20/423 odds
            for(let i = 0; i < 263; i++) {
                if(Math.random() <= (20/423)) {
                    pCount++;
                }
            }
            let rCount = 0;
            // Increments the number of rods with 1/2 odds
            for(let i = 0; i < 306; i++) {
                if(Math.random() * 100 <= 50) {
                    rCount++;
                }
            }
            pMax = Math.max(pMax, pCount);
            rMax = Math.max(rMax, rCount);
            pTotal += pCount;
            rTotal += rCount;
        }
        // Compares pearls to Dream
        const difference = pMax >= 42 ? "+" + pMax - 42 : pMax - 42;
        // Compares rods to Dream
        const difference2 = rMax >= 211 ? "+" + rMax - 211 : rMax - 211;
        const embed = new EmbedBuilder()
            .setColor("#118855")
            .setTitle("Your Results:")
            .addFields([
                { name: "Number of simulations: ", value: String(sim) },
                { name: "Average number of pearl trades: ", value: String(pTotal / sim ) },
                { name: "Average number of rods: ", value: String(rTotal / sim ) },
                { name: "Max number of pearl trades: " + pMax + "/262", value: "Number of pearl trades (Dream) 42/262" },
                { name: "Max number of rods: " + rMax + "/305", value: "Number of rods (Dream) 211/305" }
            ])
            .setFooter({ text: "Difference: " + difference + "/" + difference2 });
        await interaction.editReply({ embeds: [embed] });
    },
};