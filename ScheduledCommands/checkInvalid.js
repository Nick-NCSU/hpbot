const { EmbedBuilder } = require("discord.js");
const tokens = require("../index.js");

/**
 * Modified version of leaderboard.js to perform daily leaderboard updates and combine data
 */
module.exports = {
  data: {
    interval: "0 */5 * * * *"
  },
  async execute(client) {
    const channel = await client.channels.cache.get("1022357372854870076");
    let data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?status=new&category=zd3q41ek&max=${Math.floor(Math.random() * 10 + 10)}`);
    const blacklistedOptions = new Set(["5q8yjpkl", "0q50vd21"])
    for(const run of data.data.filter((run) => blacklistedOptions.has(run.values?.yn2m5ye8))) {
      const status = {
        "status": {
          "status": "rejected",
          "reason": "This category is managed by a bot. Please do not submit runs here."
        }
      };
      await tokens.post(`https://www.speedrun.com/api/v1/runs/${run.id}/status`, {
        method: "put",
        body: JSON.stringify(status),
        headers: {"Content-Type": "application/json", "X-API-Key": tokens.src}
      });
      let date = new Date().toISOString().slice(0, 10);
      let embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle("Automatically rejected run: " + run.weblink)
        .setFooter({ text: date });
      await channel.send({ embeds: [embed] });
    }
  },
};
