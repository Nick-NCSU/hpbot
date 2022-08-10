const tokens = require("../index.js");
const { EmbedBuilder } = require("discord.js");

/**
 * Modified version of leaderboard.js to perform daily leaderboard updates and combine data
 */
module.exports = {
    data: {
        interval: "0 0 16 * * *"
    },
    async execute(client) {
        const daily = [
            "hypixel_sb",
            "hypixel_sbce"
        ];
        const daily2 = [
            "hypixel_ce",
            "hypixel_bw",
            "hypixel_bwce",
            "hypixel_sw",
            "hypixel_ag",
            "hypixel_cg",
            "hypixel_sg",
            "hypixel_duels",
            "hypixel_tp",
            "hypixel_ww",
            "tkr",
        ];
        const blocked = [
            "9qj3gool"
        ];
        await runDaily(daily, await client.channels.cache.get("792473904391651369"), blocked);
        await sleep(10000);
        await runDaily(daily2, await client.channels.cache.get("782073727881183304"), blocked);
    },
};

/**
 * Runs the daily leaderboard
 * @param {*} games array of games to get leaderboard of
 * @param {*} channel channel to send leaderboards
 */
async function runDaily(games, channel, blocked) {
    // List of users with #1 spot
    let topPlayers = [];
    // Total combined WRs
    let totalScores = [];
    let scores;
    // Iterates through each game
    for(const game of games) {
        await generateBoard(game, channel, blocked).then(function(data) {
            scores = data;
        });
        // If top player is not already in array then add them
        if(topPlayers.indexOf(scores[0][0]) == -1) {
            topPlayers.push(scores[0][0]);
        }
        k:
        // Add all player's scores
        for(const player of scores) {
            for(const score of totalScores) {
                if(player[0] == score[0]) {
                    score[1] += player[1];
                    continue k;
                }
            }
            totalScores.push(player);
        }
        await sleep(60000);
    }
    let date = new Date().toISOString().slice(0, 10);
    let embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle("Top Players for Group:")
        .setFooter({ text: date });
    for(let player of topPlayers) {
        embed.addFields([
            {name: player.replace(/[\\*_~]/g, "\\$&"), value: "\u200b", inline: true }
        ]);
    }
    await channel.send({ embeds: [embed] });
    embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle("Top WRs for Group:")
        .setFooter({ text: date });
    totalScores.sort(function(a, b) {
        return b[1] - a[1];
    });
    let place = 1;
    for(let i = 0; i < Math.min(totalScores.length, 25); i++) {
        const player = totalScores[i];
        embed.addFields([
            { name: "#" + place + " " + player[0].replace(/[\\*_~]/g, "\\$&"), value: `WRs:${player[1]}`, inline: true }
        ]);
        if(totalScores[i + 1] && totalScores[i + 1][1] != totalScores[i][1]) {
            place++;
        }
    }
    await channel.send({ embeds: [embed] });
}
async function generateBoard(game, channel, blocked) {
    // From rsp via https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
    // Provides cartesian product of arrays
    const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

    // Retrieves all subcategories for the full game and ILs
    const {data} = await tokens.fetch(`https://www.speedrun.com/api/v1/games/${game}?embed=categories.variables,levels.variables`);
    // If nothing is returned
    if (!data) {
        return await channel.send(`No results found for **${game}**.`);
    }

    let subcategories = [];
    /**
     * Provides an array containing all subcategories for full game
     * Format: [categoryID, [Array containing ids of each variable for the category], [Array containing all combinations of variable ids]]
     */
    for(const category of data.categories.data) {
        if(category.miscellaneous) {
            continue;
        }
        if(category.type == "per-game") {
            let subArr = [];
            let idArr = [];
            for(const sub of category.variables.data) {
                if(sub["is-subcategory"]){
                    const options = Object.keys(sub.values.values).filter(option => sub.values.values[option].flags.miscellaneous !== true && !blocked.includes(option));
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

    // Full Game Progress
    let progress = 0;
    // Total Full Game
    let count = 0;
    // Last Embed Progress
    let lastEmbed = 0;
    // Counts Full Game
    for(const c of subcategories) {
        if(c[2].length == 0) {
            count++;
        } else {
            count += c[2].length;
        }
    }

    let date = new Date().toISOString().slice(0, 10);
    let embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle("Leaderboard for " + game + ":")
        .setThumbnail(data.assets["cover-large"].uri)
        .setFooter({ text: date })
        .addFields([
            { name: "Full Game Progress:", value: `${progress}/${count}` },
        ]);
    let message = await channel.send({ embeds: [embed] });
    let playerList = [];
    // Iterates through each category
    for(const c of subcategories) {
        let data2;
        // If category has no sub categories
        if(c[2].length == 0) {
            data2 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?top=1&embed=players`);
            // Gets each WR run
            for(const run of data2.data.runs) {
                b:
                // Gets each player of the run
                for(const player of run.run.players) {
                    // If player is in playerList then increment their WRs
                    for(const item of playerList) {
                        if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                            item[1] = item[1] + 1;
                            continue b;
                        }
                    }
                    if(player.rel == "user") {
                        // If player is a user then find user.id
                        for(const user of data2.data.players.data) {
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
            // Runs for each combination of subcategories
            for(const o of c[2]) {
                // Builds string of variables
                let varString = "";
                if(Array.isArray(o)) {
                    for(let i = 0; i < o.length; i++) {
                        varString += `&var-${c[1][i]}=${o[i]}`;
                    }
                } else {
                    varString += `&var-${c[1][0]}=${o}`;
                }
                data2 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + "&top=1&embed=players");
                if(!data2.data) {
                    console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + "&top=1&embed=players");
                    console.log(data2);
                    continue;
                }
                // Gets each WR run
                for(const run of data2.data.runs) {
                    b:
                    // Gets each player of the run
                    for(const player of run.run.players) {
                        // If player is in playerList then increment their WRs
                        for(const item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0].toLowerCase() == player.name.toLowerCase()) {
                                item[1] = item[1] + 1;
                                continue b;
                            }
                        }
                        if(player.rel == "user") {
                            // If player is a user then find user.id
                            for(const user of data2.data.players.data) {
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
        // Update embed if enough progress has been made
        if(Math.floor(progress/10) > lastEmbed) {
            embed = new EmbedBuilder()
                .setColor("#118855")
                .setTitle("Leaderboard for " + game + ":")
                .setThumbnail(data.assets["cover-large"].uri)
                .setFooter({ text: date })
                .addFields([
                    { name: "Full Game Progress:", value: `${progress}/${count}` },
                ]);
            await message.edit({ embeds: [embed] });
            lastEmbed = Math.floor(progress/10);
        }
    }

    // Sort by WR count
    playerList.sort(function(a, b) {
        return b[1] - a[1];
    });
    // Remove N/A
    playerList = playerList.filter(word => word[0].toLowerCase() !== "n/a");
    // Which place to display
    let place = 1;
    embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle("Leaderboard for " + game + ":")
        .setThumbnail(data.assets["cover-large"].uri)
        .setFooter({ text: date });
    for(let i = 0; i < Math.min(25, playerList.length); i++) {
        const player = playerList[i];
        embed.addFields([
            { name: "#" + place + " " + player[0].replace(/[\\*_~]/g, "\\$&"), value: `WRs:${player[1]}`, inline: true }
        ]);
        // Increment only if next WR count is not equal to this count
        if(playerList[i + 1] && playerList[i + 1][1] != playerList[i][1]) {
            place++;
        }
    }
    await message.edit({ embeds: [embed] });
    return playerList;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
