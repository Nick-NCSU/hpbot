const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getGame = async function getGame (args) {
    let data;
    console.log(await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games/${args}`).then(response => response.json())));
    return data;
}