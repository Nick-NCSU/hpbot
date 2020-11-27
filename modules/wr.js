const fetch = require('node-fetch');
const main = require('../index.js');

exports.getWr = async function getWr (args) {
    const game = args.shift();
    const category = args.shift();
    let varId;
    let variable;
    if (args[0]) {
        const vars = await main.searchVariables(game, category, args.toString().replace(",", " "));
        if(!vars || vars[0] === "" && vars[1] === "") {
            return {};
        }
        variable = vars[1];
        varId = vars[0];
    }
    return await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}?var-${varId}=${variable}&top=1&embed=players`).then(response => response.json());
}