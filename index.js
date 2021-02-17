// Imports
const { Client, MessageEmbed} = require('discord.js');
const commands = require('./commands');
const api = require('./api');
const fs = require('fs');
const cron = require("node-cron"); 
const Limit = require('./Limiter.js');
const Queue = require('queue-promise');

const limiter = new Limit(95);


const queue = new Queue({
	concurrent: 1,
	interval: 2000
});

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

// Sets bot activity and announces that bot is ready for use
client.once('ready', () => {
	client.user.setActivity('speedrun.com | src!help', { type: 'WATCHING' })
	console.log('Ready!');
});

client.on('message', async message => {
	// Checks if message starts with the given prefix
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	console.log(message.content);
	// Removes prefix from the message
	const args = message.content.slice(prefix.length).split(/ +/);
	// Sets the command to the next text after the prefix
	const command = args.shift().toLowerCase();
	queue.enqueue(async () => {
		try {
			switch(command) {
				case 'help':
					await commands.Help.help(message);
					break;
				case 'link':
					await commands.Link.link(message, args);
					break;
				case 'c':
				case 'categories':
					await commands.Categories.categories(message, args);
					break;
				case 's':
				case 'search':
					await commands.Search.search(message, args);
					break;
				/**case 'wr':
					await commands.Wr.wr(message, args);
					break;
				case 'time':
					await commands.Time.time(message, args);
					break;
				case 'lb':
					await commands.Leaderboard.lb(message, args, 'Message');
					break;*/
				case 'verified':
				case 'v':
					await commands.Verified.verified(message, args);
					break;
				case 'unverified':
				case 'uv':
					await commands.Unverified.unverified(message, args);
					break;
				case 'dream':
					await commands.Dream.dream(message, args);
					break;
				case 'lb':
					await commands.NewLeaderboard.newlb(message, args, 'Message');
					break;
			}
		} catch(err) {
			message.channel.send("An unexpected error occurred.");
			console.log(message.content);
			console.log(err);
		}
	});
});
client.login(token).then(() => {
	// Schedules the automatic daily leaderboards (Time in GMT)
	cron.schedule("30 0 4 * * *", async function() {
		queue.enqueue(async () => {
			await commands.NewLeaderboard.newlb(client.channels.cache.get('792473904391651369'), 'hypixel_sb', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('792473904391651369'), 'hypixel_sbce', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_ce', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_bw', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_sw', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_ag', 'Channel');
			await commands.NewLeaderboard.newlb(client.channels.cache.get('782073727881183304'), 'hypixel_cg', 'Channel');
		});
	});
});

// Returns a list of the players in a given run.
exports.players = async function players(args) {
	let str = "";
	for(const element of args) {
		if(element.rel == "user") {
			let temp = await api.Player.getPlayer(element.id);
			str += ', ' + temp.data.names.international;
		} else if (element.rel == "guest") {
			str += ', ' + element.name;
		}
	}
	return str.substr(2);
}

// Searches the variables in a game
exports.searchVariables = async function searchVariables(game, category, variable) {
	const {data} = await api.Categories.getCategories(game);
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
	let newdata = await api.Variables.getVariables(id);
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

exports.limit = function getLimit() {
	return limiter;
}
