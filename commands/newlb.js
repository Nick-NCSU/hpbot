const commands = require('../api');
const tokens = require('../index.js');
const fetch = require('node-fetch');
const PastebinAPI = require('pastebin-ts');
const { MessageEmbed } = require('discord.js');
exports.newlb = async function newlb(param, game, type) {
    // From rsp via https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
    const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    const pastebin = new PastebinAPI({
        'api_dev_key' : tokens.tokens().pasteapi
    });
    let channel, message;
    if(type == 'Channel') {
        channel = param;
    } else if(type == 'Message') {
        if(param.author.id != '168420049462362112') {
            return param.channel.send('<@' + param.author.id + '>\n' + `You do not have permission to use this command.`);
        }
        channel = param.channel;
        message = param;
    }
    const {data} = await commands.NewLB.getSubcategories(game);
    if (!data) {
        return channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    let subcategories = [];
    for(category of data.categories.data) {
        if(category.type == "per-game") {
            let subArr = [];
            let idArr = [];
            for(sub of category.variables.data) {
                if(sub["is-subcategory"]){
                    const options = Object.keys(sub.values.values);
                    subArr.push(options);
                    idArr.push(sub.id);
                }
            }
            let combinations = [];
            if(subArr.length != 0) {
                combinations = cartesian(...subArr);
            }
            subcategories.push([category.id, idArr, combinations]);
        }
    }
    let progress = 0;
    let lastEmbed = 0;
    let count = 0;
    for(c of subcategories) {
        if(c[2].length == 0) {
            count++;
        } else {
            count += c[2].length;
        }
    }
    let date = new Date().toISOString().slice(0, 10);
    let embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Leaderboard for ' + game + ':')
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .setFooter(date)
        .addField('Progress:', `${progress}/${count}`)
    let id = "";
    let msg = await channel.send(embed);
    let playerList = [];
    for(c of subcategories) {
        let data;
        if(c[2].length == 0) {
            data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?top=1&embed=players`).then(response => response.json());
            for(run of data.data.runs) {
                b:
                for(player of run.run.players) {
                    for(item of playerList) {
                        if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                            item[1] = item[1] + 1;
                            continue b;
                        }
                    }
                    if(player.rel == "user") {
                        for(user of data.data.players.data) {
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
            progress++;
        } else {
            for(o of c[2]) {
                let varString = "";
                if(Array.isArray(o)) {
                    for(let i = 0; i < o.length; i++) {
                        varString += `&var-${c[1][i]}=${o[i]}`;
                    }
                } else {
                    varString += `&var-${c[1][0]}=${o}`;
                }
                data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + '&top=1&embed=players').then(response => response.json());
                for(run of data.data.runs) {
                    b:
                    for(player of run.run.players) {
                        for(item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                                item[1] = item[1] + 1;
                                continue b;
                            }
                        }
                        if(player.rel == "user") {
                            for(user of data.data.players.data) {
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
                progress++;
            }
        }
        if(Math.floor(progress/10) > lastEmbed) {
            embed = new MessageEmbed()
                .setColor('118855')
                .setTitle('Leaderboard for ' + game + ':')
                .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
                .setFooter(date)
                .addField('Progress:', `${progress}/${count}`)
            msg.edit(embed);
            lastEmbed = Math.floor(progress/10);
        }
    }
    playerList.sort(function(a, b) {
        return b[1] - a[1];
    });
    let pasteString = '';
    for(player of playerList) {
        pasteString += player[0] + ', ' + player[1] + '\n';
    }
    let pasteid = '';
    await pastebin.createPaste({
        text: pasteString,
        title: game + " Leaderboard " + date,
        privacy: 1
    }).then((data) => {
        pasteid = data;
    })
    let place = 1;
    let iterator = 0;
    embed = new MessageEmbed()
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
        return msg.edit('<@' + message.author.id + `>\n${pasteid}`, embed);
    } else {
        return msg.edit(`${pasteid}`, embed);
    }
}