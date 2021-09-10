const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const token = require('../index.js');

/**
 * Returns the number of runs verified by the user
 */
 module.exports = {
    data: {
        name: 'check'
    },
	async execute(command, message) {
        if(message.channel != '795130167696556093') return;
        const igns = command.slice(1);
        const players = [];
        for(const ign of igns) {
            players.push(await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`).then(response => response.json()))
        }
        let result = '';
        for(const player of players) {
            const friends = await fetch(`https://api.hypixel.net/friends?uuid=${player.id}&key=${token.hypixel}`).then(response => response.json());
            result += player.name + ':\n';
            for(const friend of friends.records) {
                if(friend.uuidSender != player.id) {
                    for(const player2 of players) {
                        if(player2.id == friend.uuidSender) {
                            result += '\t' + player2.name + '\n';
                        }
                    }
                }
                if(friend.uuidReceiver != player.id) {
                    for(const player2 of players) {
                        if(player2.id == friend.uuidReceiver) {
                            result += '\t' + player2.name + '\n';
                        }
                    }
                }
            }
        }
        await message.channel.send(result);
	},
};