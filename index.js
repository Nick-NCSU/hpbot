const { Client, MessageEmbed } = require('discord.js');
const commands = require('./modules');

const prefix = 'src!';
const token = "NzI4NDAxODUwMDMzODk3NTc0.Xv53Fg.e27Bt75y9KUWY-ewx0hnzfvhiCQ";

const client = new Client();
const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
const fetch = require('node-fetch');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	if (command === 'link') {
		// src!link <game>
		if (!args[0]) {
			return message.channel.send('src!link <game>');
		}
		const game = args[0];
		const {data} = await commands.Link.getLink(args);
		[answer] = data;
		if (answer.length == 0) {
			return message.channel.send(`No results found for **${game}**.`);
		}
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle(answer.names.international)
			.setURL(answer.weblink)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
		message.channel.send(embed);
	}
	else if (command === 'c' || command === 'categories') {
		// src!categories <game>
		if (!args[0]) {
			return message.channel.send('src!categories <game>');
		}
		const game = args[0];
		const { data } = await commands.Categories.getCategories(args);
		if (!data.length) {
			return message.channel.send(`No results found for **${game}**.`);
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
				name3 = 'None'
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
		message.channel.send(embed);
	}
	else if (command === 'help') {
		// src!help
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('Help')
			.setThumbnail('https://www.speedrun.com/themes/Default/1st.png')
			.addField('src!help', 'Shows this help message.')
			.addField('src!link <game>', 'Sends a link to the provided game.')
			.addField('src!categories|c <game>', 'Shows the categories/variables for the provided game.')
			.addField('src!search|s <keyword> (page)', 'Searches for games containing the keyword(s).')
			.addField('src!wr <game> <category> (variable id) (variable)', 'Tells you the WR for the provided game and category.')
			.addField('src!time <game> <category> <place> (variable id) (variable)', 'Tells you the info for the provided game, category, and place.')
		message.channel.send(embed);
	}
	else if (command === 'search' || command === 's') {
		// src!search <game> (page)
		if (!args[0]) {
			return message.channel.send('src!search <game>');
		}
		const { data } = await commands.Search.getSearch(args);
		if (!data.length) {
			return message.channel.send(`No results found for **${game}**.`);
		}
		const answer = [];
		for (let i = 0; i < data.length; i++) {
			answer[i] = [];
			answer[i][0] = data[i].names.international;
			answer[i][1] = data[i].abbreviation;
		}
		if (answer.length > 25) {
			return message.channel.send('Please narrow your search. Max Results: 25 Your Results: ' + answer.length);
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
		message.channel.send(embed);
	}
	else if (command === 'wr') {
		// src!wr <game> <category> (variable id) (variable)
		// https://www.speedrun.com/api/v1/leaderboards/9dow9rm1/category/9kvo3532?var-r8rod278=gq7kv3v1&top=1
		if (!args[0]) {
			return message.channel.send('Missing Arguement: Game.\nsrc!wr <game> <category> (variable id) (variable)');
		}
		if (!args[1]) {
			return message.channel.send('Missing Arguement: Category.\nsrc!wr <game> <category> (variable id) (variable)');
		}
		if (args[2] && !args[3]) {
			return message.channel.send('Missing Arguement: variable.\nsrc!wr <game> <category> (variable id) (variable)');
		}
		const {data} = await commands.Wr.getWr(args);
		if (!data) {
			return message.channel.send(`No results found for **${game}**.`);
		}
		const dataArr = data;
		const runLength = new Date(dataArr.runs[0].run.times.primary_t * 1000).toISOString().slice(11, -1);
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('World Record for ' + game + ': ' + category)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
			.addField('Time', runLength)
			.addField('WR Holder', dataArr.players.data[0].names.international)
			.addField('Run Link', dataArr.runs[0].run.weblink)
			.addField('Run Video Link', dataArr.runs[0].run.videos.links[0].uri)
			.addField('Description', dataArr.runs[0].run.comment)
		message.channel.send(embed);
	}
	else if (command === 'time') {
		// src!wr <game> <category> <place> (variable id) (variable)
		// https://www.speedrun.com/api/v1/leaderboards/9dow9rm1/category/9kvo3532?var-r8rod278=gq7kv3v1
		if (!args[0]) {
			return message.channel.send('Missing Arguement: Game.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		const game = args.shift();
		if (!args[0]) {
			return message.channel.send('Missing Arguement: Category.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		const category = args.shift();
		if (!args[0]) {
			return message.channel.send('Missing Arguement: Place.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		const place = args.shift();
		if (args[0] && !args[1]) {
			return message.channel.send('Missing Arguement: variable.\nsrc!time <game> <category> <place> (variable id) (variable)');
		}
		let varId;
		let variable;
		if (args[0] && args[1]) {
			varId = args.shift();
			variable = args.shift();
		}
		const { data } = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}?var-${varId}=${variable}&embed=players`).then(response => response.json());
		if (!data) {
			return message.channel.send(`No results found for **${game}**.`);
		}
		const dataArr = data;
		const runLength = new Date(dataArr.runs[place - 1].run.times.primary_t * 1000).toISOString().slice(11, -1);
		const embed = new MessageEmbed()
			.setColor('118855')
			.setTitle('Result for ' + game + ': ' + category)
			.setThumbnail(`https://www.speedrun.com/themes/${game}/cover-256.png`)
			.addField('Time', runLength)
			.addField('Runner', dataArr.players.data[place - 1].names.international)
			.addField('Run Link', dataArr.runs[place - 1].run.weblink)
			.addField('Run Video Link', dataArr.runs[place - 1].run.videos.links[0].uri)
			.addField('Description', dataArr.runs[place - 1].run.comment)
		message.channel.send(embed);
	}
});
client.login(token);
