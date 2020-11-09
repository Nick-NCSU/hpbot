const fetch = require('node-fetch');

exports.getWr = async function getLink (args) {
    const game = args[0];
    const category = args[1];
    let varId;
    let variable;
    if (args[2] && args[3]) {
        varId = args.shift();
        variable = args.toString().replace(",", " ");
    }
    return await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}?var-${varId}=${variable}&top=1&embed=players`).then(response => response.json());
}