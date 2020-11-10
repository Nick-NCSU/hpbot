const fetch = require('node-fetch');

exports.getPlayer = async function getPlayer (id) {
    return await fetch(`https://www.speedrun.com/api/v1/users/${id}`).then(response => response.json());
}