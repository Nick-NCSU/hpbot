const fetch = require('node-fetch');

exports.getGame = async function getGame (args) {
    return await fetch(`https://www.speedrun.com/api/v1/games/${args}`).then(response => response.json());
}