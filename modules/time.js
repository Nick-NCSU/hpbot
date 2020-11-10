const fetch = require('node-fetch');

exports.getTime = async function getTime (args) {
    const game = args.shift();
    const category = args.shift();
    let varId;
    let variable;
    if (args[0] && args[1]) {
        varId = args.shift();
        variable = args.toString().replace(",", " ");
    }
    return await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}?var-${varId}=${variable}&embed=players`).then(response => response.json());
}