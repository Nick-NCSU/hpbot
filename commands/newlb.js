const commands = require('../api');
const tokens = require('../index.js');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

exports.newlb = async function newlb(param, game, type) {
    // From rsp via https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
    // Provides cartesian product of arrays
    const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    let channel, message;
    if(type == 'Channel') {
        channel = param;
    } else if(type == 'Message') {
        channel = param.channel;
        message = param;
    }

    // Retrieves all subcategories for the full game and ILs
    const {data} = await commands.NewLB.getSubcategories(game);
    // If nothing is returned
    if (!data) {
        return channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
    }
    let subcategories = [];
    let sublevels = [];

    /**
     * Provides an array containing all subcategories for full game
     * Format: [categoryID, [Array containing ids of each variable for the category], [Array containing all combinations of variable ids]]
     */
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
    /**
     * Provides an array containing all subcategories for individual levels
     * Format: [levelID, [categoryID, [Array containing ids of each variable for the category], [Array containing all combinations of variable ids]]]
     */
    for(level of data.levels.data) {
        for(category of data.categories.data) {
            if(category.type == "per-level") {
                let subArr = [];
                let idArr = [];
                for(sub of level.variables.data) {
                    if(sub["is-subcategory"] && (!sub.category || sub.category == category.id)) {
                        const options = Object.keys(sub.values.values);
                        subArr.push(options);
                        idArr.push(sub.id);
                    }
                }
                let combinations = [];
                if(subArr.length != 0) {
                    combinations = cartesian(...subArr);
                }
                sublevels.push([level.id, [category.id, idArr, combinations]]);
            }
        }
    }
    let progress = 0;
    let progress2 = 0;
    let count = 0;
    let count2 = 0;
    let lastEmbed = 0;
    for(c of subcategories) {
        if(c[2].length == 0) {
            count++;
        } else {
            count += c[2].length;
        }
    }
    for(c of sublevels) {
        if(c[1][2].length == 0) {
            count2++;
        } else {
            count2 += c[1][2].length;
        }
    }
    if(count + count2 > 500) {
        return channel.send('<@' + message.author.id + '>\n' + `Game ${game} has too many categories. Number of categories: ${count + count2}.`);
    }
    let date = new Date().toISOString().slice(0, 10);
    let embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Leaderboard for ' + game + ':')
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .setFooter(date)
        .addField('Full Game Progress:', `${progress}/${count}`)
        .addField('Individual Levels Progress:', `${progress2}/${count2}`)
    let msg = await channel.send(embed);
    let playerList = [];

    for(c of subcategories) {
        let data;
        if(c[2].length == 0) {
            await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?top=1&embed=players`).then(response => response.json()));
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
                await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + '&top=1&embed=players').then(response => response.json()));
                if(!data.data) {
                    console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + '&top=1&embed=players');
                    console.log(data);
                    continue;
                }
                for(run of data.data.runs) {
                    b:
                    for(player of run.run.players) {
                        for(item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0].toLowerCase() == player.name.toLowerCase()) {
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
                .addField('Full Game Progress:', `${progress}/${count}`)
                .addField('Individual Levels Progress:', `${progress2}/${count2}`)
            msg.edit(embed);
            lastEmbed = Math.floor(progress/10);
        }
    }

    for(c of sublevels) {
        let data;
        if(c[1][2].length == 0) {
            await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?top=1&embed=players`).then(response => response.json()));
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
            progress2++;
        } else {
            for(o of c[1][2]) {
                let varString = "";
                if(Array.isArray(o)) {
                    for(let i = 0; i < o.length; i++) {
                        varString += `&var-${c[1][1][i]}=${o[i]}`;
                    }
                } else {
                    varString += `&var-${c[1][1][0]}=${o}`;
                }
                await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + '&top=1&embed=players').then(response => response.json()));
                if(!data.data) {
                    console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + '&top=1&embed=players');
                    console.log(data);
                    continue;
                }
                for(run of data.data.runs) {
                    b:
                    for(player of run.run.players) {
                        for(item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0].toLowerCase() == player.name.toLowerCase()) {
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
                progress2++;
            }
        }
        if(Math.floor(progress2/10) > lastEmbed) {
            embed = new MessageEmbed()
                .setColor('118855')
                .setTitle('Leaderboard for ' + game + ':')
                .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
                .setFooter(date)
                .addField('Full Game Progress:', `${progress}/${count}`)
                .addField('Individual Levels Progress:', `${progress2}/${count2}`)
            msg.edit(embed);
            lastEmbed = Math.floor(progress2/10);
        }
    }

    playerList.sort(function(a, b) {
        return b[1] - a[1];
    });
    playerList = playerList.filter(word => word[0].toLowerCase() !== 'n/a');
    let place = 1;
    let iterator = 0;
    let countPlayer = 0;
    embed = new MessageEmbed()
        .setColor('118855')
        .setTitle('Leaderboard for ' + game + ':')
        .setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
        .setFooter(date)
        for(player of playerList) {
            embed.addField('#' + place + ' ' + player[0].replace(/[*_~]/g, "\\$&"), `WRs:${player[1]}`, true)
            countPlayer++;
            if(playerList[iterator + 1] && playerList[iterator + 1][1] != playerList[iterator][1]) {
                place++;
            }
            if(countPlayer > 30) {
                break;
            }
            iterator++;
        }
    if(type == 'Channel') {
        await msg.edit(embed);
        return playerList;
    } else {
        await msg.edit('<@' + message.author.id + `>\n`, embed);
    }
}