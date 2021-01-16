const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getVariables = async function getVariables (id) {
    let data;
    console.log(await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/categories/${id}/variables`).then(response => response.json())));
    return data;
}