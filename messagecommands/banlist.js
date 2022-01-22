const { MessageEmbed } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const token = require('../index.js');

/**
 * Interacts with banlist database
 */
 module.exports = {
    data: {
        name: 'banlist'
    },
	async execute(command, message) {
        if(message.channel != '795130167696556093' && message.channel != '728402518014689333') return;
        switch(command[1]) {
            case 'add':
                await add(command[2], message);
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
                message.reply('src!banlist list\nsrc!banlist add (player)\nsrc!banlist remove (player)\nsrc!banlist search (player)')
        }
	},
};

async function add(id, message) {
    const date = new Date().toISOString();
    const player = await fetch(`https://api.mojang.com/users/profiles/minecraft/${id}`).then(response => response.json()).catch( reason => {});
    if(!player) {
        return await message.reply('Player does not exist');
    }
    if(!player.id) {
        return await message.reply('Error getting UUID');
    }
    const doc = {
        id: player.id,
        owner: message.author.id,
        time: date
    }
    await token.db.connect();
    await token.db.db('banned_runners').collection('mc').insertOne(doc);
    await token.db.close();
    return await message.reply('Player added to banlist');
}

async function del(id, message) {
    const player = await fetch(`https://api.mojang.com/users/profiles/minecraft/${id}`).then(response => response.json()).catch( reason => {});
    if(!player) {
        return await message.reply('Player does not exist');
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db('banned_runners').collection('mc').deleteMany(query);
    if (result.deletedCount >= 1) {
        await token.db.close();
        return await message.reply("Successfully deleted player.");
    } else {
        await token.db.close();
        return await message.reply("Player did not exist in banlist");
    }
}

async function list(message) {
    await token.db.connect();
    const cursor = token.db.db('banned_runners').collection('mc').find();
    let results = await cursor.toArray();
    await token.db.close();
    let str = '```';
    for(const player of results) {
        const player2 = await fetch(`https://api.mojang.com/user/profiles/${player.id}/names`).then(response => response.json()).catch( reason => {});
        str += 'IGN: ' + player2[player2.length - 1].name + '\n';
    }
    return await message.reply(str + '```');
}

async function search(id, message) {
    const player = await fetch(`https://api.mojang.com/users/profiles/minecraft/${id}`).then(response => response.json()).catch( reason => {});
    if(!player) {
        return await message.reply('Player does not exist');
    }
    const query = { id: player.id };
    await token.db.connect();
    const result = await token.db.db('banned_runners').collection('mc').findOne(query);
    await token.db.close();
    if(!result) {
        return await message.reply('Player is not in banlist');
    }
    const embed = new MessageEmbed()
            .setColor('118855')
            .setTitle(`Name: ${id}`)
            .addField('UUID', result.id)
            .addField('Added by', '<@' + result.owner + '>')
            .addField('Date', result.time.substr(0, 10))
    return await message.reply({ embeds: [embed] });
}