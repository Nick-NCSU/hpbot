const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription('Provides a list of commands and descriptions.'),
	async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Help')
            .setThumbnail('https://www.speedrun.com/images/1st.png')
            .addField('/help', 'Shows this help message.')
            .addField('/hypixel', 'Provides helpful links for Hypixel Speedruns')
            .addField('/link <game>', 'Sends a link to the provided game.')
            .addField('/categories <game>', 'Shows the categories/variables for the provided game.')
            .addField('/search <keyword> (page)', 'Searches for games containing the keyword(s).')
            .addField('/leaderboard <game>', 'Provides a leaderboard for the given game.')
            .addField('/verified <user>', 'Provides the number of runs verified by the given user.')
            .addField('/queuelength <game>', 'Provides the number of unverified runs for the given game.')
            .addField('/dream', 'Simulates Dream\'s pearl and blaze rod odds.')
            .addField('/ping', 'Provides bot response time.')
        await interaction.editReply('Sending you help!');
        await interaction.followUp({ embeds: [embed], ephemeral: true });
	},
};