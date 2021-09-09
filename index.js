// Imports
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const Limit = require('./Limiter.js');
const Queue = require('queue-promise');
const limiter = new Limit(95);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fetch = require('node-fetch');

// Creates a rate limiting queue
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
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(token);
/**
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands('728401850033897574'),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
*/
// Sets bot activity and announces that bot is ready for use
client.once('ready', async () => {
	client.user.setActivity('speedrun.com | /help', { type: 'WATCHING' })
	console.log('Ready!');
});

client.on('messageCreate', async message => {
	// Checks if message starts with the given prefix
	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
	console.log(message.content);
	//await message.reply("Please use the slash commands instead of the src! prefix.");
});

client.on('interactionCreate', async interaction => {
	if(interaction.isCommand()) {
		if (!client.commands.has(interaction.commandName)) return;
		await interaction.deferReply();
		try {
			await client.commands.get(interaction.commandName).execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if(interaction.isSelectMenu()) {
		await client.commands.get('hypixel').execute(interaction);
	}
});

client.login(token);

exports.tokens = token;

exports.limit = function getLimit() {
	return limiter;
}

exports.queue = function getQueue() {
	return queue;
}

exports.fetch = async function limitFetch(text) {
	let data;
	while(1) {
		console.log(limiter.points);
		await limiter.removePoints(1).then(data = await fetch(text).then(response => response.json()));
		if(data.status != 420) {
			return data;
		}
		sleep(2000);
	}
}

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
}