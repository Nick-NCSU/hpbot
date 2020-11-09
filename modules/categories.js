const fetch = require('node-fetch');

exports.getCategories = async function getLink (args) {
    const game = args.shift();
    return await fetch(`https://www.speedrun.com/api/v1/games?abbreviation=${game}&embed=categories.variables`).then(response => response.json());
}