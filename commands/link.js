const commands = require('../api');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * Function to provide a link to the given game
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Sends a link to the provided game.')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to link')
                .setRequired(true)
        ),
	async execute(interaction) {
        const game = interaction.options.get('game').value.toLowerCase();
        const {data} = await commands.Link.getLink(game);
        [answer] = data;
        // Checks if game exists
        if (!answer || answer.length == 0) {
            return await interaction.editReply(`No results found for **${game}**.`);
        }
        // Embed to return
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle(answer.names.international)
            .setURL(answer.weblink)
            .setThumbnail(answer.assets["cover-large"].uri)
        await interaction.editReply({ embeds: [embed] });
	},
};