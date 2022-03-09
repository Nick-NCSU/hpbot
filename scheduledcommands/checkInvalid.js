const tokens = require("../index.js");

/**
 * Modified version of leaderboard.js to perform daily leaderboard updates and combine data
 */
module.exports = {
    data: {
        interval: "0 */5 * * * *"
    },
    async execute(client) {
        let data = await tokens.fetch(`https://www.speedrun.com/api/v1/runs?status=new&category=zd3q41ek&max=${Math.floor(Math.random() * 10 + 10)}`);
        for(const run of data.data) {
            const status = {
                "status": {
                    "status": "rejected",
                    "reason": "This run is managed by a bot. Please do not submit runs here."
                }
            };
            await tokens.post(`https://www.speedrun.com/api/v1/runs/${run.id}/status`, {
                method: "put",
                body: JSON.stringify(status),
                headers: {"Content-Type": "application/json", "X-API-Key": tokens.src}
            });
        }
    },
};