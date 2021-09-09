const tokens = require('../index.js');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Provides a leaderboard for the given game.')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to get leaderboard')
                .setRequired(true)
        ),
	async execute(interaction) {
        // From rsp via https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
        // Provides cartesian product of arrays
        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const game = interaction.options.get('game').value.toLowerCase();

        // Retrieves all subcategories for the full game and ILs
        const {data} = await tokens.fetch(`https://www.speedrun.com/api/v1/games/${game}?embed=categories.variables,levels.variables`);
        // If nothing is returned
        if (!data) {
            return await interaction.editReply(`No results found for **${game}**.`);
        }

        let subcategories = [];
        let sublevels = [];
        /**
         * Provides an array containing all subcategories for full game
         * Format: [categoryID, [Array containing ids of each variable for the category], [Array containing all combinations of variable ids]]
         */
        for(const category of data.categories.data) {
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
        for(const level of data.levels.data) {
            for(const category of data.categories.data) {
                if(category.type == "per-level") {
                    let subArr = [];
                    let idArr = [];
                    for(const sub of level.variables.data) {
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

        // Full Game Progress
        let progress = 0;
        // IL Progress
        let progress2 = 0;
        // Total Full Game
        let count = 0;
        // Total IL
        let count2 = 0;
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
        // Counts ILs
        for(const c of sublevels) {
            if(c[1][2].length == 0) {
                count2++;
            } else {
                count2 += c[1][2].length;
            }
        }

        if(count + count2 > 500) {
            return await interaction.editReply(`Game ${game} has too many categories. Number of categories: ${count + count2}.`);
        }

        let date = new Date().toISOString().slice(0, 10);
        let embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Leaderboard for ' + game + ':')
            .setThumbnail(data.assets["cover-large"].uri)
            .setFooter(date)
            .addField('Full Game Progress:', `${progress}/${count}`)
            .addField('Individual Levels Progress:', `${progress2}/${count2}`)
        await interaction.editReply({ embeds: [embed] });
        let playerList = [];

        for(const c of subcategories) {
            let data2;
            // If category has no sub categories
            if(c[2].length == 0) {
                data2 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?top=1&embed=players`);
                for(const run of data2.data.runs) {
                    b:
                    for(const player of run.run.players) {
                        for(const item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                                item[1] = item[1] + 1;
                                continue b;
                            }
                        }
                        if(player.rel == "user") {
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
                for(const o of c[2]) {
                    let varString = "";
                    if(Array.isArray(o)) {
                        for(let i = 0; i < o.length; i++) {
                            varString += `&var-${c[1][i]}=${o[i]}`;
                        }
                    } else {
                        varString += `&var-${c[1][0]}=${o}`;
                    }
                    data2 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + '&top=1&embed=players');
                    if(!data2.data) {
                        console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${c[0]}?` + varString.substr(1) + '&top=1&embed=players');
                        console.log(data2);
                        continue;
                    }
                    for(const run of data2.data.runs) {
                        b:
                        for(const player of run.run.players) {
                            for(const item of playerList) {
                                if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0].toLowerCase() == player.name.toLowerCase()) {
                                    item[1] = item[1] + 1;
                                    continue b;
                                }
                            }
                            if(player.rel == "user") {
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
            if(Math.floor(progress/10) > lastEmbed) {
                embed = new MessageEmbed()
                    .setColor('118855')
                    .setTitle('Leaderboard for ' + game + ':')
                    .setThumbnail(data.assets["cover-large"].uri)
                    .setFooter(date)
                    .addField('Full Game Progress:', `${progress}/${count}`)
                    .addField('Individual Levels Progress:', `${progress2}/${count2}`)
                await interaction.editReply({ embeds: [embed] });
                lastEmbed = Math.floor(progress/10);
            }
        }

        for(const c of sublevels) {
            let data3;
            if(c[1][2].length == 0) {
                data3 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?top=1&embed=players`);
                for(const run of data3.data.runs) {
                    b:
                    for(const player of run.run.players) {
                        for(const item of playerList) {
                            if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0] == player.name) {
                                item[1] = item[1] + 1;
                                continue b;
                            }
                        }
                        if(player.rel == "user") {
                            for(const user of data3.data.players.data) {
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
                for(const o of c[1][2]) {
                    let varString = "";
                    if(Array.isArray(o)) {
                        for(let i = 0; i < o.length; i++) {
                            varString += `&var-${c[1][1][i]}=${o[i]}`;
                        }
                    } else {
                        varString += `&var-${c[1][1][0]}=${o}`;
                    }
                    data3 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + '&top=1&embed=players');
                    if(!data3.data) {
                        console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + '&top=1&embed=players');
                        console.log(data3);
                        continue;
                    }
                    for(const run of data3.data.runs) {
                        b:
                        for(const player of run.run.players) {
                            for(const item of playerList) {
                                if(player.rel == "user" && item[2] == player.id || player.rel == "guest" && item[0].toLowerCase() == player.name.toLowerCase()) {
                                    item[1] = item[1] + 1;
                                    continue b;
                                }
                            }
                            if(player.rel == "user") {
                                for(const user of data3.data.players.data) {
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
                    .setThumbnail(data.assets["cover-large"].uri)
                    .setFooter(date)
                    .addField('Full Game Progress:', `${progress}/${count}`)
                    .addField('Individual Levels Progress:', `${progress2}/${count2}`)
                await interaction.editReply({ embeds: [embed] });
                lastEmbed = Math.floor(progress2/10);
            }
        }

        // Sort by WR count
        playerList.sort(function(a, b) {
            return b[1] - a[1];
        });
        // Remove N/A
        playerList = playerList.filter(word => word[0].toLowerCase() !== 'n/a');
        // Which place to display
        let place = 1;
        let iterator = 0;
        let countPlayer = 0;
        embed = new MessageEmbed()
            .setColor('118855')
            .setTitle('Leaderboard for ' + game + ':')
            .setThumbnail(data.assets["cover-large"].uri)
            .setFooter(date)
        for(const player of playerList) {
            embed.addField('#' + place + ' ' + player[0].replace(/[*_~]/g, "\\$&"), `WRs:${player[1]}`, true)
            countPlayer++;
            // Increment only if next WR count is not equal to this count
            if(playerList[iterator + 1] && playerList[iterator + 1][1] != playerList[iterator][1]) {
                place++;
            }
            if(countPlayer > 30) {
                break;
            }
            iterator++;
        }
        await interaction.editReply({ embeds: [embed] });
	},
};