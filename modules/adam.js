const fetch = require('node-fetch');

exports.getAdam = async function getAdam() {
    return await fetch(`https://api.hypixel.net/status?key=bb145a4c-0d7d-44a6-8729-122bfb391952&uuid=bbf10ad0-c547-465b-baba-3b8e44e5e95a`).then(response => response.json());
}