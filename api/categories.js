const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getCategories = async function getCategories (args) {
    const game = args;
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}&embed=categories.variables`).then(response => response.json()));
    return data;
}