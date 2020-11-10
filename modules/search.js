const fetch = require('node-fetch');

exports.getSearch = async function getSearch (args) {
    const game = args.shift();
    let page = 0;
    if (args[0]) {
        page = (args.shift() - 1) * 20;
    }
    return await fetch(`https://www.speedrun.com/api/v1/games?name=${game}&offset=${page}`).then(response => response.json());
}