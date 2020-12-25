const fetch = require('node-fetch');

exports.getUser = async function getUser (args) {
    return await fetch(`https://www.speedrun.com/api/v1/users/${args}`).then(response => response.json());
}