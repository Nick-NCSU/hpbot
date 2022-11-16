const tokens = require("../index.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    interval: "0 10 * * * *"
  },
  async execute(client) {
    const games = [
      "hypixel_sb",
      "hypixel_sbce",
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
      "hypixel_dropper",
      "mcm_hm",
      "mcm_sw",
      "mcm_wotf",
      "mcm_bbf",
      "mcm_cd",
      "mcm_hr",
      "mcm_za",
      "tkr",
      "hypixel_zombies",
      "hypixel_pg",
      "hypixel_smp",
    ];
    for(const game of games) {
      await checkRuns(game, client);
      await sleep(5000);
    }
  },
};

async function checkRuns(game, client) {
  const channel = await client.channels.cache.get("1022357372854870076");
  const gameData = await tokens.fetch(`https://www.speedrun.com/api/v1/games/${game}`);
  let data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?status=new&game=${gameData.data?.id}&max=200`);
  const oldRuns = [];
  for(const run of data.data) {
    const submittedTime = new Date(run.submitted);
    if(Date.now() - submittedTime.getTime() > 14 * 24 * 60 * 60 * 1000) {
      oldRuns.push(run);
    }
  }

  if(oldRuns.length) {
    let embed = new EmbedBuilder()
      .setColor("#118855")
      .setTitle("Old unverified runs found for game: " + gameData.data?.names?.international)
      .addFields(...oldRuns.slice(0, 25).map((run) => {
        return {
          name: run.weblink,
          value: `<t:${run.submitted}:R>`,
        };
      }));
    await channel.send({ embeds: [embed] });
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
