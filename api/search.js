const fetch = require('node-fetch');
const tokens = require('../index.js');

exports.getSearch = async function getSearch (args) {
    const game = args.shift();
    let page = 0;
    if (args[0]) {
        page = (args.shift() - 1) * 20;
    }
    let data;
    console.log(await tokens.limit().removeTokens(1).then(data = await fetch(`https://www.speedrun.com/api/v1/games?name=${game}&offset=${page}`).then(response => response.json())));
    return data;
}