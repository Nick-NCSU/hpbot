// Imports
const { Client, MessageEmbed} = require('discord.js');
const commands = require('./commands');
const fs = require('fs');
const cron = require("node-cron"); 

// Prefix to call the bot
const prefix = 'src!';
// Determines the token for bot
let token = '';
let pasteapi = '';
if (fs.existsSync('./token.json')) {
	const tokenFile = require('./token.json');
	token = tokenFile.token;
	pasteapi = tokenFile.pasteAPI;
} else {
	token = process.env.token;
	pasteapi = process.env.pasteapi;
}

// Creates new Client
const client = new Client();
const fetch = require('node-fetch');
const { lb } = require('./commands/leaderboard');

// Sets bot activity and announces that bot is ready for use
client.once('ready', () => {
	client.user.setActivity('speedrun.com', { type: 'WATCHING' })
	console.log('Ready!');
});

client.on('message', async message => {
	// Checks if message starts with the given prefix
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Removes prefix from the message
	const args = message.content.slice(prefix.length).split(/ +/);
	// Sets the command to the next text after the prefix
	const command = args.shift().toLowerCase();
	switch(command) {
		case 'help':
			commands.Help.help(message);
			break;
		case 'link':
			commands.Link.link(message, args);
			break;
		case 'c':
		case 'categories':
			commands.Categories.categories(message, args);
			break;
		case 's':
		case 'search':
			commands.Search.search(message, args);
			break;
		case 'wr':
			commands.Wr.wr(message, args);
			break;
		case 'time':
			commands.Time.time(message, args);
			break;
		case 'lb':
			commands.Leaderboard.lb(message, args, 'Message');
			break;
		case 'verified':
		case 'v':
			commands.Verified.verified(message, args);
			break;
		case 'unverified':
		case 'uv':
			commands.Unverified.unverified(message, args);
			break;
		case 'dream':
			commands.Dream.dream(message, args);
			break;
		case 'newlb':
			commands.NewLeaderboard.newlb(message, args, 'Message');
			break;
	}
});
client.login(token).then(() => {
	cron.schedule("30 0 4 * * *", async function() {
		commands.NewLeaderboard.newlb(client.channels.cache.get('792473904391651369'), 'hypixel_sb', 'Channel');
	});
	cron.schedule("30 5 4 * * *", async function() {
		commands.NewLeaderboard.newlb(client.channels.cache.get('792473904391651369'), 'hypixel_sbce', 'Channel');
	});
	cron.schedule("30 10 4 * * *", async function() {
		commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_ce', 'Channel');
	});
	cron.schedule("30 15 4 * * *", async function() {
		commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_bw', 'Channel');
	});
	cron.schedule("30 20 4 * * *", async function() {
		commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_sw', 'Channel');
	});
});

exports.players = async function players(args) {
	let str = "";
	for(const element of args) {
		if(element.rel == "user") {
			let temp = await commands.Player.getPlayer(element.id);
			str += ', ' + temp.data.names.international;
		} else if (element.rel == "guest") {
			str += ', ' + element.name;
		}
	}
	return str.substr(2);
}

exports.searchVariables = async function searchVariables(game, category, variable) {
	const {data} = await commands.Categories.getCategories(game);
	let id = "";
	let id2 = "";
	let num1 = 0;
	let num2 = 0;
	if(!data[0]){
		return["",""];
	}
	a:
	for(item of data[0].categories.data) {
		if(item.name.toLowerCase().trim() === category.toLowerCase().trim()) {
			for(item2 of item.variables.data) {
				for(item3 in item2.values.values) {
					const check = data[0].categories.data[num1].variables.data[num2].values.values[item3].label;
					if(check.toLowerCase().trim() === variable.toLowerCase().trim()) {
						id = item.id;
						id2 = item2.id;
						break a;
					}
				}
				num2++;
			}
		}
		num1++;
	}
	let newdata = await commands.Variables.getVariables(id);
	if(!newdata.data) {
		return ["",""];
	}
	for(const data1 of newdata.data) {
		if(data1.id === id2) {
			for(const element in data1.values.values) {
				if(data1.values.values[element].label.toLowerCase().trim() === variable.toLowerCase().trim()) {
					return [data1.id, element];
				}
			}
		}
	}
}

exports.tokens = function getTokens() {
	return {
		token: token,
		pasteapi: pasteapi
	}
}