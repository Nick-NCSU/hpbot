const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dream')
        .setDescription('Simulates Dream\'s pearl and blaze rod odds.')
        .addIntegerOption(option =>
            option.setName('simulations')
                .setDescription('Number of simulations to run (Max 1,000,000')
                .setRequired(true)
        ),
	async execute(interaction) {
        let sim = interaction.options.get('simulations');
        if(!sim) {
            sim = 1;
        } else {
            sim = sim.value;
        }
        if(sim > 1000000) {
            return await interaction.editReply('Too many simulations (' + sim + ')');
        }
        let pMax = 0;
        let rMax = 0;
        let pTotal = 0;
        let rTotal = 0;
        for(let count = 0; count < sim; count++) {
            let pCount = 0;
            for(let i = 0; i < 263; i++) {
                if(Math.random() <= (20/423)) {
                    pCount++;
                }
            }
            let rCount = 0;
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
        const difference = pMax >= 42 ? '+' + pMax - 42 : pMax - 42;
        const difference2 = rMax >= 211 ? '+' + rMax - 211 : rMax - 211;
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Your Results:')
            .addField('Number of simulations: ', String(sim))
            .addField('Average number of pearl trades: ', String(pTotal / sim))
            .addField('Average number of rods: ', String(rTotal / sim))
            .addField('Max number of pearl trades: ' + pMax + '/262', 'Number of pearl trades (Dream): 42/262')
            .addField('Max number of rods: ' + rMax + '/305', 'Number of rods (Dream): 211/305')
            .setFooter('Difference: ' + difference + '/' + difference2)
        await interaction.editReply({ embeds: [embed] });
	},
};