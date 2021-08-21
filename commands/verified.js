const commands = require('../api');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * Returns the number of runs verified by the user
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('verified')
        .setDescription('Provides the number of runs verified by the given user.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User to search')
                .setRequired(true)
        ),
	async execute(interaction) {
        const user = interaction.options.get('user').value.toLowerCase();
        //Search for user on speedrun.com
        const playerData = await commands.User.getUser(user);
        //If player doesn't exist
        if(!playerData.data) {
            return await interaction.editReply('User does not exist.');
        }
        //Retrieve runs for game
        const id = playerData.data.id;
        let data = await commands.Examine.getExamine(id);
        //While the pagination.size == 200 keep looping
        while (data.size == 200 && data.offset != 9800){
            data = await commands.Examine.getExamine(id, data.offset + 200);
        }
        //Number of runs = the total offset + the current size
        const num = data.offset + data.size;
        //Creates embed
        const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Result for: ' + user)
            .addField('Number of runs verified: ', num >= 10000 ? '>= 10k' : String(num))
        return await interaction.editReply({ embeds: [embed] });
	},
};