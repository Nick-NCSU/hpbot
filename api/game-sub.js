const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getSubcategories = async function getSubcategories (game) {
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games/${game}?embed=categories.variables,levels.variables`).then(response => response.json()));
    return data;
}