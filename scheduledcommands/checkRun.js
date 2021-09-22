const { MessageEmbed } = require('discord.js');
const token = require('../index.js');

module.exports = {
    data: {
        interval: "0 0 0 * * *"
    },
	async execute(client) {
        const gameData = await token.fetch(`https://www.speedrun.com/api/v1/runs?game=m1z9l2d0&status=new`);
        for(run of gameData.data) {
            if(run.values["j845q35n"] == "rqv0z7wl" && !run.comment.includes("/replay")) {
                client.channels.cache.get("728402518014689333").send(run.weblink);
            }
        }
	},
};