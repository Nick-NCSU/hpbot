const fetch = require('node-fetch');

exports.getSubcategories = async function getSubcategories (game) {
    return await fetch(`https://www.speedrun.com/api/v1/games/${game}?embed=categories.variables,levels.variables`).then(response => response.json());
}