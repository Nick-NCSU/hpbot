const fetch = require('node-fetch');

exports.getLeaderboard = async function getLeaderboard (game) {
    return await fetch(`https://www.speedrun.com/api/v1/games/${game}/records?skip-empty=yes&top=1&max=200&embed=players`).then(response => response.json());
}