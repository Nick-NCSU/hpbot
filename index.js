const { Client, MessageEmbed } = require('discord.js');
const commands = require('./modules');

const prefix = 'src!';
const token = "NzI4NDAxODUwMDMzODk3NTc0.Xv53Fg.e27Bt75y9KUWY-ewx0hnzfvhiCQ";

const client = new Client();
const fetch = require('node-fetch');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	switch(command) {
		case 'help':
			help();
			break;
		case 'link':
			link();
			break;
		case 'c':
		case 'categories':
			categories();
			break;
		case 's':
		case 'search':
			search();
			break;
		case 'wr':
			wr();
			break;
		case 'time':
			time();
			break;
	}

	async function link() {
		if (!args[0]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'src!link <game>');
		}
		const game = args[0];
		const {data} = await commands.Link.getLink(args);
		[answer] = data;
		if (!answer || answer.length == 0) {
			return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
		}
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle(answer.names.international)
			.setURL(answer.weblink)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}

	async function categories() {
		if (!args[0]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'src!categories <game>');
		}
		const game = args[0];
		const { data } = await commands.Categories.getCategories(args.shift());
		if (!data.length) {
			return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
		}
		const [dataArr] = data;
		const category = [];
		for (let i = 0; i < dataArr.categories.data.length; i++) {
			category[i] = [];
			category[i][0] = dataArr.categories.data[i].name;
			if (dataArr.categories.data[i].variables.data[0]) {
				let varArr = dataArr.categories.data[i].variables.data[0].values.values;
				varArr = Object.values(varArr);
				for (let j = 0; j < varArr.length; j++) {
					category[i][j + 1] = varArr[j].label;
				}
			}
		}
		let name1, name3;
		let name2 = '';
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle(dataArr.names.international)
			.setURL(dataArr.weblink)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
		for (let k = 0; k < category.length; k++) {
			name1 = category[k][0];
			if (dataArr.categories.data[k].variables.data[0]) {
				name3 = dataArr.categories.data[k].variables.data[0].id;
			}
			else {
				name3 = 'None';
			}
			for (let m = 0; m < category[k].length - 1; m++) {
				name2 += category[k][m + 1];
				if (m < category[k].length - 2) {
					name2 += ', ';
				}
			}
			if (!name2) {
				name2 = 'None';
			}
			embed.addField('**Category:** ' + name1 + '** - id:** ' + name3, ' **Variables:** ' + name2 + '\n');
			name2 = '';
		}
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}

	function help() {
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('Help')
			.setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
			.addField('src!help', 'Shows this help message.')
			.addField('src!link <game>', 'Sends a link to the provided game.')
			.addField('src!categories|c <game>', 'Shows the categories/variables for the provided game.')
			.addField('src!search|s <keyword> (page)', 'Searches for games containing the keyword(s).')
			.addField('src!wr <game> <category> (variable)', 'Tells you the WR for the provided game and category. (Only supports one variable currently)')
			.addField('src!time <game> <category> <place> (variable id) (variable)', 'Tells you the info for the provided game, category, and place.')
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}

	async function search() {
		if (!args[0]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'src!search <game>');
		}
		const game = args[0];
		const { data } = await commands.Search.getSearch(args);
		if (!data.length) {
			return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
		}
		const answer = [];
		for (let i = 0; i < data.length; i++) {
			answer[i] = [];
			answer[i][0] = data[i].names.international;
			answer[i][1] = data[i].abbreviation;
		}
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('Results (' + answer.length + ')')
			.setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
		answer.forEach(entry => {
			embed.addField(entry[0], entry[1]);
		});
		if (answer.length == 20) {
			embed.setFooter('There may be more pages. Use src!search <game> <page>')
		}
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}

	async function wr() {
		if (!args[0]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Game.\nsrc!wr <game> <category> (variable)');
		}
		if (!args[1]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Category.\nsrc!wr <game> <category> (variable)');
		}
		const game = args[0];
		const category = args[1];
		const {data} = await commands.Wr.getWr(args);
		if (!data) {
			return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
		}
		const dataArr = data;
		const runLength = new Date(dataArr.runs[0].run.times.primary_t * 1000).toISOString().slice(11, -1);
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('World Record for ' + game + ': ' + category)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
			.addField('Time', runLength)
			.addField('WR Holder', await players(dataArr.runs[0].run.players))
			.addField('Run Link', dataArr.runs[0].run.weblink)
			.addField('Run Video Link', dataArr.runs[0].run.videos.links[0].uri)
			.addField('Description', dataArr.runs[0].run.comment)
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}

	async function time() {
		if (!args[0]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Game.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		if (!args[1]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Category.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		if (!args[2]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: Place.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		if (args[3] && !args[4]) {
			return message.channel.send('<@' + message.author.id + '>\n' + 'Missing Arguement: variable.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		const game = args[0];
		const category = args[1];
		const place = args[2];
		const { data } = await commands.Time.getTime(args);
		if (!data) {
			return message.channel.send('<@' + message.author.id + '>\n' + `No results found for **${game}**.`);
		}
		const dataArr = data;
		const runLength = new Date(dataArr.runs[place - 1].run.times.primary_t * 1000).toISOString().slice(11, -1);
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('Result for ' + game + ': ' + category)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
			.addField('Time', runLength)
			.addField('Runner(s)', await players(dataArr.runs[place - 1].run.players))
			.addField('Run Link', dataArr.runs[place - 1].run.weblink)
			.addField('Run Video Link', dataArr.runs[place - 1].run.videos.links[0].uri)
			.addField('Description', dataArr.runs[place - 1].run.comment)
		message.channel.send('<@' + message.author.id + '>\n', embed);
	}
});
client.login(token);

async function players(args) {
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