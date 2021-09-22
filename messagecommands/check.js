const fetch = require('node-fetch');
const token = require('../index.js');

/**
 * Checks a list of players for friends/guild members
 */
 module.exports = {
    data: {
        name: 'check'
    },
	async execute(command, message) {
        if(message.channel != '795130167696556093' && message.channel != '728402518014689333') return;
        const igns = command.slice(1);
        const players = [];
        let result = '```\n';
        for(const ign of igns) {
            const player = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`).then(response => response.json()).catch( reason => {});
            if(player) {
                players.push(player);
            } else {
                result += ign + ' does not exist.\n';
            }
        }
        for(const player of players) {
            const friends = await fetch(`https://api.hypixel.net/friends?uuid=${player.id}&key=${token.hypixel}`).then(response => response.json());
            const guild = await fetch(`https://api.hypixel.net/guild?player=${player.id}&key=${token.hypixel}`).then(response => response.json())
            result += player.name + ':\n';
            for(const friend of friends.records) {
                if(friend.uuidSender != player.id) {
                    for(const player2 of players) {
                        if(player2.id == friend.uuidSender) {
                            result += '\t' + player2.name + ' (Friend)\n';
                        }
                    }
                }
                if(friend.uuidReceiver != player.id) {
                    for(const player2 of players) {
                        if(player2.id == friend.uuidReceiver) {
                            result += '\t' + player2.name + ' (Friend)\n';
                        }
                    }
                }
            }
            if(guild.guild) {
                for(const gm of guild.guild.members) {
                    for(const player2 of players) {
                        if(player2.id != player.id && gm.uuid == player2.id) {
                            result += '\t' + player2.name + ' (Guild)\n';
                        }
                    }
                }
            }
            const query = { id: player.id };
            await token.db.connect();
            const searchResult = await token.db.db('banned_runners').collection('mc').findOne(query);
            await token.db.close();
            if(searchResult) {
                result += '\t' + player.name + ' (**Banlist**)\n';
            }
        }
        await message.channel.send(result + '```');
	},
};