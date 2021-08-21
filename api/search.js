const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getSearch = async function getSearch (game, page = 1) {
    page = --page * 20;
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games?name=${game}&offset=${page}`).then(response => response.json()));
    return data;
}