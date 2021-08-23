const commands = require('../api');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * Function to provide a link to the given game
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('queuelength')
        .setDescription('Provides the number of unverified runs for the given game.')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to search')
                .setRequired(true)
        ),
	async execute(interaction) {
        const game = interaction.options.get('game').value.toLowerCase();
        const gameData = await commands.Game.getGame(game);
        if(!gameData.data) {
            return await interaction.editReply('Game does not exist.');
        }
        const id = gameData.data.id;
        let data = await commands.New.getUnexamine(id);
        const firstPage = data.data[0];
        while (data.pagination.size == 200){
            data = await commands.New.getUnexamine(id, data.pagination.offset + 200);
        }
        const num = data.pagination.offset + data.pagination.size;
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Result for: ' + game)
            .setThumbnail(gameData.data.assets["cover-large"].uri)
        if(firstPage) {
            embed.addField('Number of unverified runs: ', String(num))
                .addField('Oldest unverified run: ', firstPage.submitted.substring(0,10))
        } else {
            embed.addField('Number of unverified runs: ', String(num))
        }
        await interaction.editReply({ embeds: [embed] });
	},
};