const fetch = require('node-fetch');

exports.getUnexamine = async function getUnexamine (game, offset) {
    return await fetch(`https://www.speedrun.com/api/v1/runs?game=${game}&status=new&max=200&orderby=date&direction=asc&offset=${offset}`).then(response => response.json());
}