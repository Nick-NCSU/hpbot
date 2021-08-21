const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Provides bot response time.'),
	async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('118855')
            .setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
            .setTitle(`Ping: ${Date.now() - interaction.createdTimestamp}ms`)
        await interaction.editReply({ embeds: [embed] });
	},
};