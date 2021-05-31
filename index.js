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
	concurrent: 1
});

// Prefix to call the bot
const prefix = 'src!';
// Determines the token for bot
let token = '';
if (fs.existsSync('./token.json')) {
	const tokenFile = require('./token.json');
	token = tokenFile.token;
} else {
	token = process.env.token;
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
	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
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
				case 'ping':
					await commands.Ping.ping(client, message);
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
	cron.schedule("15 0 4 * * *", async function() {
		const daily = [
			['792473904391651369', 'hypixel_sb'],
			['792473904391651369', 'hypixel_sbce'],
			['782073727881183304', 'hypixel_ce'],
			['782073727881183304', 'hypixel_bw'],
			['782073727881183304', 'hypixel_sw'],
			['782073727881183304', 'hypixel_ag'],
			['782073727881183304', 'hypixel_cg'],
			['782073727881183304', 'tkr'],
			['782073727881183304', 'mcm_za'],
			['782073727881183304', 'mcm_wotf'],
			['782073727881183304', 'mcm_hr'],
			['782073727881183304', 'mcm_sw'],
			['782073727881183304', 'mcm_hm'],
			['782073727881183304', 'mcm_cd']
		];
		for(lb of daily) {
			await dailyLB(lb[0], lb[1]);
			await wait(60000);
		}
	});
	function dailyLB(channel, game) {
		return new Promise((resolve) => {
			queue.enqueue(async () => {
				await commands.NewLeaderboard.newlb(client.channels.cache.get(channel), game, 'Channel');
				resolve();
			});
		});
	}
	function wait(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
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

exports.tokens = token;

exports.limit = function getLimit() {
	return limiter;
}
