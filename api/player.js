const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getPlayer = async function getPlayer (id) {
    let data;
    console.log(await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/users/${id}`).then(response => response.json())));
    return data;
}