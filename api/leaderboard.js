const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getLeaderboard = async function getLeaderboard (game) {
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games/${game}/records?skip-empty=yes&top=1&max=200&embed=players`).then(response => response.json()));
    return data;
}