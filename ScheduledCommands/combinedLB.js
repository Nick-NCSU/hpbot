const { EmbedBuilder } = require("discord.js");
const tokens = require("../index.js");

/**
 * Modified version of leaderboard.js to perform daily leaderboard updates and combine data
 */
module.exports = {
  data: {
    interval: "0 0 6 * * *"
  },
  async execute(client) {
    await findPlayers("m1z9l2d0", "824m59e2", {}, "Solo");
    await findPlayers("m1z9l2d0", "wkpmj40k", { "68kdmk4l": "5lm4rz8l" }, "Doubles");
    await findPlayers("m1z9l2d0", "wdmlzyxk", { "wl33656l": "mln04koq" }, "3v3v3v3");
    await findPlayers("m1z9l2d0", "vdom0912", { "wlex6zx8": "9qj46j7q" }, "4v4v4v4");
    await findPlayers("m1z9l2d0", "wkpm70jk", { "wlexj3x8": "klrym0jq" }, "4v4");
    await updateRuns("m1z9l2d0", "zd3q41ek", { "yn2m5ye8": "5q8yjpkl" }, 5, client);

    players = [];
    await findPlayers("m1z9l2d0", "824m59e2", {}, "Solo");
    await findPlayers("m1z9l2d0", "wkpmj40k", { "68kdmk4l": "jq6x93vq" }, "Doubles");
    await findPlayers("m1z9l2d0", "wdmlzyxk", { "wl33656l": "4qyyv86q" }, "3v3v3v3");
    await findPlayers("m1z9l2d0", "vdom0912", { "wlex6zx8": "810mo3ol" }, "4v4v4v4");
    await findPlayers("m1z9l2d0", "wkpm70jk", { "wlexj3x8": "21d3wy4q" }, "4v4");
    await updateRuns("m1z9l2d0", "zd3q41ek", { "yn2m5ye8": "0q50vd21" }, 5, client);
  },
};

let players = [];

async function findPlayers(game, category, vars, mode) {
  const varMap = Object.entries(vars);
  const varString = varMap.length ? `?${varMap.map(([variable, option]) => `var-${variable}=${option}`).join("&")}` : "";
  const data = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}${varString}`);
  // Iterates through the runs in the category
  for (const run of data.data.runs) {
    // Iterates through each player in the run
    for (const player of run.run.players) {
      // If the player is a guest then skip
      if (player.rel == "user") {
        // If the player already exists in players then find
        // them and update their time if needed.
        const existingPlayer = players.find((p) => p.id === player.id);
        if (existingPlayer) {
          if (!existingPlayer.runs[mode]) {
            existingPlayer.runs[mode] = {
              time: run.run.times.primary_t,
              link: run.run.weblink
            };
          } else if (run.run.times.primary_t < existingPlayer.runs[mode]) {
            existingPlayer.runs[mode].time = run.run.times.primary_t;
            existingPlayer.runs[mode].link = run.run.weblink;
          }
        } else {
          players.push({
            id: player.id,
            runs: {
              [mode]: {
                time: run.run.times.primary_t,
                link: run.run.weblink
              }
            }
          });
        }
      }
    }
  }
}

async function updateRuns(game, category, vars, count, client) {
  const channel = await client.channels.cache.get("1022357372854870076");
  let date = new Date().toISOString().slice(0, 10);
  let embed = new EmbedBuilder()
    .setColor("#118855")
    .setTitle("Generating combined leaderboard for " + players.length + " players")
    .setFooter({ text: date });
  await channel.send({ embeds: [embed] });

  const varMap = Object.entries(vars);
  const varString = varMap.length ? `?${varMap.map(([variable, option]) => `var-${variable}=${option}`).join("&")}` : "";

  const data = await tokens.fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}${varString}`);
  console.log(JSON.stringify(players.find(p => p.id === 'x3554nqj')));
  // Filters out only the players with a time in every category
  players = players.filter(player => Object.keys(player.runs).length === count);
  console.log(JSON.stringify(players, null, 2));
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
    const total = Object.values(player.runs).reduce((total, run) => total + run.time, 0).toFixed(3);
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
        category,
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
        comment: Object.entries(player.runs).map(([mode, info]) => `${mode}: ${info.link}`).join("\n"),
        variables: varMap.reduce((variables, variable) => {
          variables[variable[0]] = {
            type: "pre-defined",
            value: variable[1],
          };
          return variables;
        }, {})
      }
    };
    console.log(JSON.stringify(run, null, 2));
    // Submits the run
    // const submittedRun = await tokens.post("https://www.speedrun.com/api/v1/runs", {
    //   method: "post",
    //   body: JSON.stringify(run),
    //   headers: { "Content-Type": "application/json", "X-API-Key": tokens.src }
    // });
    // weblinks.push(submittedRun.data?.weblink);
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