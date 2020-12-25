const fetch = require('node-fetch');

exports.getVariables = async function getVariables (id) {
    return await fetch(`https://www.speedrun.com/api/v1/categories/${id}/variables`).then(response => response.json());
}