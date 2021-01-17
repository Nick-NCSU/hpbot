const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getExamine = async function getExamine (args, offset) {
    const user = args;
    let data;
    await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/runs?examiner=${user}&max=200&offset=${offset}`).then(response => response.json()));
    return data.pagination;
}