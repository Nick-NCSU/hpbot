const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getLink = async function getLink (args) {
    const game = args.shift();
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}`).then(response => response.json()));
    return data;
}