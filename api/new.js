const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getUnexamine = async function getUnexamine (game, offset) {
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/runs?game=${game}&status=new&max=200&orderby=date&direction=asc&offset=${offset}`).then(response => response.json()));
    return data;
}