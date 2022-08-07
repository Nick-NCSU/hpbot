const { EmbedBuilder } = require("discord.js");
const token = require("../index.js");

/**
 * Interacts with banlist database
 */
module.exports = {
    data: {
        name: "runners"
    },
    async execute(command, message) {
        // Command only works in certain channels (staff-commands and my testing server)
        if((command[1] == "add" || command[1] == "remove") && message.channel != "795130167696556093" && message.channel != "728402518014689333") return;
        switch(command[1]) {
        case "add":
            await add(command[2], command[3], message);
            break;
        case "remove":
            await del(command[2], message);
            break;
        case "list":
            await list(message);
            break;
        case "search":
            await search(command[2], message);
            break;
        case "searchsrc":
            await searchSRC(command[2], message);
            break;
        default:
            message.reply("src!runners list\nsrc!runners add (player) (src account)\nsrc!runners remove (player)\nsrc!runners search (player)\nsrc!runners searchsrc (user)");
        }
    },
};

/**
 * Adds an account to the runners
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function add(id, account, message) {
    if(!id || !account) {
        return await message.reply("src!runners add (player) (src account)");
    }
    const date = new Date().toISOString();
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    const src = await token.fetch(`https://www.speedrun.com/api/v1/users/${account}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    if(!player.id) {
        return await message.reply("Error getting UUID");
    }
    if(!src.data) {
        return await message.reply("SRC Account does not exist");
    }
    const doc = {
        id: player.id,
        owner: message.author.id,
        time: date,
        account: src.data.id
    };
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db("known_runners").collection("mc").findOne(query);
    if(!result) {
        await token.db.db("known_runners").collection("mc").insertOne(doc);
        await token.db.close();
        return await message.reply("Player added to known runners");
    }
    await token.db.close();
    return await message.reply("Player already known");
}

/**
 * Deletes user from the runners
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function del(id, message) {
    if(!id) {
        return await message.reply("src!runners remove (player)");
    }
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db("known_runners").collection("mc").deleteMany(query);
    if (result.deletedCount >= 1) {
        await token.db.close();
        return await message.reply("Successfully deleted player.");
    } else {
        await token.db.close();
        return await message.reply("Player did not exist in known runners");
    }
}

/**
 * Lists the known runners
 * @param {*} message message to reply to
 * @returns message reply
 */
async function list(message) {
    await token.db.connect();
    const cursor = token.db.db("known_runners").collection("mc").find();
    let results = await cursor.toArray();
    await token.db.close();
    let str = "```";
    for(const player of results) {
        const player2 = await token.fetchMojang(`https://api.mojang.com/user/profiles/${player.id}/names`);
        str += player2[player2.length - 1].name + ", ";
    }
    return await message.reply(str.slice(0, -2) + "```");
}

/**
 * Searches for a known runner in the database and returns who added them
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function search(id, message) {
    if(!id) {
        return await message.reply("src!runners search (player)");
    }
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db("known_runners").collection("mc").findOne(query);
    await token.db.close();
    if(!result) {
        return await message.reply("Player is not in known runners");
    }
    const src = await token.fetch(`https://www.speedrun.com/api/v1/users/${result.account}`);
    const embed = new EmbedBuilder()
        .setColor(118855)
        .setTitle(`Name: ${id}`)
        .setURL(`https://sk1er.club/s/${id}`)
        .addFields([
            { name: "Speedrun.com", value: src.data.weblink },
            { name: "UUID", value: result.id },
            { name: "Added by", value: "<@" + result.owner + ">" },
            { name: "Date", value: result.time.substr(0, 10) }
        ]);
    return await message.reply({ embeds: [embed] });
}

/**
 * Searches for a known runner in the database and returns who added them
 * @param {*} id SRC username of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function searchSRC(id, message) {
    if(!id) {
        return await message.reply("src!runners searchsrc (user)");
    }
    // Gets player from src api
    const src = await token.fetch(`https://www.speedrun.com/api/v1/users/${id}`);
    if(!src.data) {
        return await message.reply("SRC user does not exist");
    }
    const query = { account: src.data.id };
    await token.db.connect();
    const result = await token.db.db("known_runners").collection("mc").find(query);
    if(!result.hasNext) {
        return await message.reply("Player is not in known runners");
    }
    const accounts = await result.toArray();
    await token.db.close();
    const embed = new EmbedBuilder()
        .setColor(118855)
        .setTitle(`Name: ${src.data.names.international}`)
        .setURL(src.data.weblink);
    for(const account of accounts) {
        // Gets player from mojang api
        const player = await token.fetchMojang(`https://api.mojang.com/user/profiles/${account.id}/names`);
        embed.addFields([
            { name: `${player[player.length - 1].name}`, value: `[Stats](https://sk1er.club/s/${player[player.length - 1].name})` }
        ]);
    }
    return await message.reply({ embeds: [embed] });
}