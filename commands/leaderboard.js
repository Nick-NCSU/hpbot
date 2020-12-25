const commands = require('../api');
const { MessageEmbed } = require('discord.js');
exports.lb = async function lb(param, game, type) {
    let channel, message;
    if(type == 'Channel') {
        channel = param;
    } else if(type == 'Message') {
        channel = param.channel;
        message = param;
    }
    const {data} = await commands.Leaderboard.getLeaderboard(game);
    if (!data) {
        return channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    let playerList = [];
    for(board of data) {
        b:
        for(player of board.runs[0].run.players) {
            for(item of playerList) {
                if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                    item[1] = item[1] + 1;
                    continue b;
                }
            }
            if(player.rel == "user") {
                for(user of board.players.data) {
                    if(player.id == user.id) {
                        playerList.push([user.names.international, 1, user.id]);
                        continue b;
                    }
                }
            } else if(player.rel == "guest") {
                playerList.push([player.name, 1, player.name]);
                continue b;
            }
        }
    }
    playerList.sort(function(a, b) {
        return b[1] - a[1];
    });
    let place = 1;
    let iterator = 0;
    const date = new Date().toISOString().slice(0, 10);
    const embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Leaderboard for ' + game + ':')
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .setFooter(date)
        for(player of playerList) {
            if(player[2] == "user") {
                let temp = await commands.Player.getPlayer(player[0]);
                player[0] = temp.data.names.international;
            }
            embed.addField('#' + place + ' ' + player[0], `WRs:${player[1]}`, true)
            if(playerList[iterator + 1] && playerList[iterator + 1][1] != playerList[iterator][1]) {
                place++;
            }
            iterator++;
        }
    if(message) {
        return message.channel.send('<@' + message.author.id + '>\n', embed);
    } else {
        return channel.send(embed);
    }
    
}