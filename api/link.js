const fetch = require('node-fetch');

exports.getLink = async function getLink (args) {
    const game = args.shift();
    return await fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}`).then(response => response.json());
}