const { EmbedBuilder } = require("discord.js");
const token = require("../index.js");

/**
 * Interacts with banlist database
 */
module.exports = {
    data: {
        name: "banlist"
    },
    async execute(command, message) {
        // Command only works in certain channels (staff-commands and my testing server)
        if(message.channel != "795130167696556093" && message.channel != "728402518014689333") return;
        switch(command[1]) {
        case "add":
            await add(command[2], message);
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
        default:
            message.reply("src!banlist list\nsrc!banlist add (player)\nsrc!banlist remove (player)\nsrc!banlist search (player)");
        }
    },
};

/**
 * Adds an account to the banlist
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function add(id, message) {
    const date = new Date().toISOString();
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    if(!player.id) {
        return await message.reply("Error getting UUID");
    }
    const doc = {
        id: player.id,
        owner: message.author.id,
        time: date
    };
    await token.db.db("banned_runners").collection("mc").insertOne(doc);
    return await message.reply("Player added to banlist");
}

/**
 * Deletes user from the banlist
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function del(id, message) {
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    const query = { id: player.id };
    const result = await token.db.db("banned_runners").collection("mc").deleteMany(query);
    if (result.deletedCount >= 1) {
        return await message.reply("Successfully deleted player.");
    } else {
        return await message.reply("Player did not exist in banlist");
    }
}

/**
 * Lists the banned runners
 * @param {*} message message to reply to
 * @returns message reply
 */
async function list(message) {
    const cursor = token.db.db("banned_runners").collection("mc").find();
    let results = await cursor.toArray();
    let str = "```";
    for(const player of results) {
        const player2 = await token.fetchMojang(`https://api.mojang.com/user/profiles/${player.id}/names`);
        str += "IGN: " + player2[player2.length - 1].name + "\n";
    }
    return await message.reply(str + "```");
}

/**
 * Searches for a banned runner in the database and returns their reason for ban
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function search(id, message) {
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply("Player does not exist");
    }
    const query = { id: player.id };
    const result = await token.db.db("banned_runners").collection("mc").findOne(query);
    if(!result) {
        return await message.reply("Player is not in banlist");
    }
    const embed = new EmbedBuilder()
        .setColor("#118855")
        .setTitle(`Name: ${id}`)
        .addFields([
            { name: "UUID", value: result.id },
            { name: "Added by", value: "<@" + result.owner + ">" },
            { name: "Date", value: result.time.substr(0, 10) }
        ]);
    return await message.reply({ embeds: [embed] });
}