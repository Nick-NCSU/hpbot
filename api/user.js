const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getUser = async function getUser (args) {
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/users/${args}`).then(response => response.json()));
    return data;
}