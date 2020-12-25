const fetch = require('node-fetch');

exports.getExamine = async function getExamine (args, offset) {
    const user = args;
    const data = await fetch(`https://www.speedrun.com/api/v1/runs?examiner=${user}&max=200&offset=${offset}`).then(response => response.json());
    return data.pagination;
}