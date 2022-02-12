const { MessageEmbed } = require('discord.js');
const token = require('../index.js');

/**
 * Interacts with banlist database
 */
 module.exports = {
    data: {
        name: 'runners'
    },
	async execute(command, message) {
        // Command only works in certain channels (staff-commands and my testing server)
        if(command[1] != 'list' && command[1] != 'search' && message.channel != '795130167696556093' && message.channel != '728402518014689333') return;
        switch(command[1]) {
            case 'add':
                await add(command[2], command[3], message);
                break;
            case 'remove':
                await del(command[2], message);
                break;
            case 'list':
                await list(message);
                break;
            case 'search':
                await search(command[2], message);
                break;
            default:
                message.reply('src!runners list\nsrc!runners add (player) (src account)\nsrc!runners remove (player)\nsrc!runners search (player)')
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
        return await message.reply('src!runners add (player) (src account)');
    }
    const date = new Date().toISOString();
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply('Player does not exist');
    }
    if(!player.id) {
        return await message.reply('Error getting UUID');
    }
    const doc = {
        id: player.id,
        owner: message.author.id,
        time: date,
        account: account
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db('known_runners').collection('mc').findOne(query);
    if(!result) {
        await token.db.db('known_runners').collection('mc').insertOne(doc);
        await token.db.close();
        return await message.reply('Player added to known runners');
    }
    await token.db.close();
    return await message.reply('Player already known');
}

/**
 * Deletes user from the runners
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function del(id, message) {
    if(!id) {
        return await message.reply('src!runners remove (player)');
    }
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply('Player does not exist');
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db('known_runners').collection('mc').deleteMany(query);
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
    const cursor = token.db.db('known_runners').collection('mc').find();
    let results = await cursor.toArray();
    await token.db.close();
    let str = '```';
    for(const player of results) {
        const player2 = await token.fetchMojang(`https://api.mojang.com/user/profiles/${player.id}/names`);
        str += player2[player2.length - 1].name + ': ' + `https://speedrun.com/user/${player.account}\n`;
    }
    return await message.reply(str + '```');
}

/**
 * Searches for a known runner in the database and returns who added them
 * @param {*} id username/uuid of the user
 * @param {*} message message to reply to
 * @returns message reply
 */
async function search(id, message) {
    if(!id) {
        return await message.reply('src!runners search (player)');
    }
    // Gets player from mojang api
    const player = await token.fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${id}`);
    if(!player) {
        return await message.reply('Player does not exist');
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db('known_runners').collection('mc').findOne(query);
    await token.db.close();
    if(!result) {
        return await message.reply('Player is not in known runners');
    }
    const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle(`Name: ${id}`)
            .setURL(`https://sk1er.club/s/${id}`)
            .addField('Speedrun.com', `https://speedrun.com/user/${result.account}`)
            .addField('UUID', result.id)
            .addField('Added by', '<@' + result.owner + '>')
            .addField('Date', result.time.substr(0, 10))
    return await message.reply({ embeds: [embed] });
}