const { EmbedBuilder } = require("@discordjs/builders");
const tokens = require("../index.js");

/**
 * Modified version of leaderboard.js to perform daily leaderboard updates and combine data
 */
module.exports = {
  data: {
    interval: "0 0 6 * * *"
  },
  async execute(client) {
    await findPlayers("824m59e2", "Solo");
    await findPlayers("wkpmj40k", "Doubles");
    await findPlayers("wdmlzyxk", "3v3v3v3");
    await findPlayers("vdom0912", "4v4v4v4");
    await findPlayers("wkpm70jk", "4v4");
    await updateRuns("zd3q41ek", [["yn2m5ye8", "5q8yjpkl"]], client);
  },
};

let players = [];

async function findPlayers(category, mode) {
  const data = await tokens.fetch(`https://www.speedrun.com/api/v1/categories/${category}/records?top=10000`);
  // Iterates through the runs in the category
  for (const run of data.data[0].runs) {
    // Iterates through each player in the run
    for (const player of run.run.players) {
      // If the player is a guest then skip
      if (player.rel == "user") {
        // If the player already exists in players then find
        // them and update their time if needed.
        if (players.some(p => p.id == player.id)) {
          for (const record of players) {
            if (record.id == player.id) {
              if (!record[mode]) {
                record[mode] = {
                  time: run.run.times.primary_t,
                  link: run.run.weblink
                };
              } else if (run.run.times.primary_t < record[mode]) {
                record[mode].time = run.run.times.primary_t;
                record[mode].link = run.run.weblink;
              }
              break;
            }
          }
        } else {
          let p = {
            id: player.id,
            [mode]: {
              time: run.run.times.primary_t,
              link: run.run.weblink
            }
          };
          players.push(p);
        }
      }
    }
  }
}

async function updateRuns(category, vars, client) {
  const channel = await client.channels.cache.get("795130255324348456");
  let date = new Date().toISOString().slice(0, 10);
  let embed = new EmbedBuilder()
    .setColor("#118855")
    .setTitle("Generating combined leaderboard for " + players.length + " players")
    .setFooter({ text: date });
  await channel.send({ embeds: [embed] });

  const data = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/m1z9l2d0/category/zd3q41ek?top=100${vars.length ? "&" : ""}${vars.map(([k, v]) => `var-${k}=${v}`).join("&")}`);
  // Filters out only the players with a time in every category
  players = players.filter(function (player) {
    return Object.prototype.hasOwnProperty.call(player, "Solo") &&
      Object.prototype.hasOwnProperty.call(player, "Doubles") &&
      Object.prototype.hasOwnProperty.call(player, "3v3v3v3") &&
      Object.prototype.hasOwnProperty.call(player, "4v4v4v4") &&
      Object.prototype.hasOwnProperty.call(player, "4v4");
  });

  embed = new EmbedBuilder()
    .setColor("#118855")
    .setTitle("Found " + players.length + " players with runs in all categories")
    .setFooter({ text: date });
  await channel.send({ embeds: [embed] });
  const weblinks = [];

  next:
  // Iterates through each player
  for (const player of players) {
    // Adds up their time
    const total = (player["Solo"].time + player["Doubles"].time + player["3v3v3v3"].time + player["4v4v4v4"].time + player["4v4"].time).toFixed(3);
    // Goes through the runs and if any have a faster or same time then
    // skip this player.
    for (const run of data.data.runs) {
      if (run.run.players[0].id == player.id) {
        if (total - run.run.times.primary_t >= 0) {
          continue next;
        }
      }
    }
    // Creates the run
    const run = {
      run: {
        category: category,
        platform: "8gej2n93",
        verified: true,
        times: {
          realtime: parseFloat(total)
        },
        players: [
          {
            rel: "user",
            id: player.id
          }
        ],
        emulated: false,
        comment: `Solo: ${player["Solo"].link}\nDoubles: ${player["Doubles"].link}\n3v3v3v3: ${player["3v3v3v3"].link}\n4v4v4v4: ${player["4v4v4v4"].link}\n4v4: ${player["4v4"].link}`,
        variables: vars.reduce((variables, variable) => {
          variables[variable[0]] = {
            type: "pre-defined",
            value: variable[1],
          };
          return variables;
        }, {})
      }
    };
    // Submits the run
    const submittedRun = await tokens.post("https://www.speedrun.com/api/v1/runs", {
      method: "post",
      body: JSON.stringify(run),
      headers: { "Content-Type": "application/json", "X-API-Key": tokens.src }
    });
    weblinks.push(submittedRun.weblink);
  }
  embed = new EmbedBuilder()
    .setColor("#118855")
    .setTitle(weblinks.length + " runs found to update/create.")
    .setFooter({ text: date });
  await channel.send({ embeds: [embed] });

  for (let i = 0; i < weblinks.length; i += 20) {
    await channel.send("```\n" + weblinks.slice(i, i + 20).join("\n") + "```");
  }
}