const token = require('../index.js');

/**
 * Checks a list of players for friends/guild members and the banlist
 */
 module.exports = {
    data: {
        name: 'check'
    },
	async execute(command, message) {
        // Command only works in certain channels (staff-commands and my testing server)
        if(message.channel != '795130167696556093' && message.channel != '728402518014689333') return;
        const igns = command.slice(1);
        const players = [];
        let result = '```\n';
        // Gets uuid of each ign
        for(const ign of igns) {
            const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
            if(player) {
                players.push(player);
            } else {
                result += ign + ' does not exist.\n';
            }
        }
        for(const player of players) {
            // Gets friends list of player
            const friends = await token.fetchHypixel(`https://api.hypixel.net/friends?uuid=${player.id}&key=${token.hypixel}`);
            // Gets guild list of player
            const guild = await token.fetchHypixel(`https://api.hypixel.net/guild?player=${player.id}&key=${token.hypixel}`);
            result += player.name + ':\n';
            // Checks if player is friends with other players
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
            // Checks if player is in guild with other players
            if(guild.guild) {
                for(const gm of guild.guild.members) {
                    for(const player2 of players) {
                        if(player2.id != player.id && gm.uuid == player2.id) {
                            result += '\t' + player2.name + ' (Guild)\n';
                        }
                    }
                }
            }
            // Checks if player is in banlist
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