const tokens = require("../index.js");
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Function to provide a leaderboard of WRs to a certain game
 */
module.exports = {
    /**
     * Builds /leaderboard [string:game]
     */
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Provides a leaderboard for the given game.")
        .addStringOption(option =>
            option.setName("game")
                .setDescription("Game to get leaderboard")
                .setRequired(true)
        )
        .addBooleanOption(option => 
            option.setName("misc")
                .setDescription("Include misc categories? Default: true")
        )
        .addBooleanOption(option => 
            option.setName("fullgame")
                .setDescription("Include Full Game Categories? Default: true")
        )
        .addBooleanOption(option => 
            option.setName("ils")
                .setDescription("Include Individual Levels? Default: true")
        ),
    async execute(params) {
        const { interaction } = params;
        // From rsp via https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
        // Provides cartesian product of arrays
        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const game = interaction.options.get("game").value.toLowerCase();
        const misc = interaction.options.get("misc")?.value ?? true;
        const fullgame = interaction.options.get("fullgame")?.value ?? true;
        const ils = interaction.options.get("ils")?.value ?? true;

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
        if(fullgame) {
            for(const category of data.categories.data) {
                if(!misc && category.miscellaneous) {
                    continue;
                }
                if(category.type == "per-game") {
                    let subArr = [];
                    let idArr = [];
                    for(const sub of category.variables.data) {
                        if(sub["is-subcategory"]){
                            let options = Object.keys(sub.values.values);
                            if(!misc) {
                                options = options.filter(option => sub.values.values[option].flags.miscellaneous !== true);
                            }
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
        }
        /**
         * Provides an array containing all subcategories for individual levels
         * Format: [levelID, [categoryID, [Array containing ids of each variable for the category], [Array containing all combinations of variable ids]]]
         */
        if(ils) {
            for(const level of data.levels.data) {
                for(const category of data.categories.data) {
                    if(category.type == "per-level") {
                        let subArr = [];
                        let idArr = [];
                        for(const sub of level.variables.data) {
                            if(sub["is-subcategory"] && (!sub.category || sub.category == category.id)) {
                                let options = Object.keys(sub.values.values);
                                if(!misc) {
                                    options = options.filter(option => sub.values[option].flags.miscellaneous !== true);
                                }
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

        if(!game.startsWith("hypixel_") && count + count2 > 500) {
            return await interaction.editReply(`Game ${game} has too many categories. Number of categories: ${count + count2}.`);
        }

        let date = new Date().toISOString().slice(0, 10);
        let embed = new EmbedBuilder()
            .setColor("#118855")
            .setTitle("Leaderboard for " + game + ":")
            .setThumbnail(data.assets["cover-large"].uri)
            .setFooter({ text: date })
            .addFields([
                { name: "Full Game Progress:", value: `${progress}/${count}` },
                { name: "Individual Levels Progress:", value: `${progress2}/${count2}` }
            ]);
        await interaction.editReply({ embeds: [embed] });
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
                        { name: "Individual Levels Progress:", value: `${progress2}/${count2}` }
                    ]);
                await interaction.editReply({ embeds: [embed] });
                lastEmbed = Math.floor(progress/10);
            }
        }
        
        // Iterates through each level
        for(const c of sublevels) {
            let data3;
            // If level has no sub categories
            if(c[1][2].length == 0) {
                data3 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?top=1&embed=players`);
                // Gets each WR run
                for(const run of data3.data.runs) {
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
                // Runs for each combination of sublevels
                for(const o of c[1][2]) {
                    // Builds string of variables
                    let varString = "";
                    if(Array.isArray(o)) {
                        for(let i = 0; i < o.length; i++) {
                            varString += `&var-${c[1][1][i]}=${o[i]}`;
                        }
                    } else {
                        varString += `&var-${c[1][1][0]}=${o}`;
                    }
                    data3 = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + "&top=1&embed=players");
                    if(!data3.data) {
                        console.log(`https://www.speedrun.com/api/v1/leaderboards/${game}/level/${c[0]}/${c[1][0]}?` + varString.substr(1) + "&top=1&embed=players");
                        console.log(data3);
                        continue;
                    }
                    // Gets each WR run
                    for(const run of data3.data.runs) {
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
            // Update embed if enough progress has been made
            if(Math.floor(progress2/10) > lastEmbed) {
                embed = new EmbedBuilder()
                    .setColor("#118855")
                    .setTitle("Leaderboard for " + game + ":")
                    .setThumbnail(data.assets["cover-large"].uri)
                    .setFooter({ text: date })
                    .addFields([
                        { name: "Full Game Progress:", value: `${progress}/${count}` },
                        { name: "Individual Levels Progress:", value: `${progress2}/${count2}` }
                    ]);
                await interaction.editReply({ embeds: [embed] });
                lastEmbed = Math.floor(progress2/10);
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
        await interaction.editReply({ embeds: [embed] });
    },
};