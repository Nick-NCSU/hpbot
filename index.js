// Imports
const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const Limit = require("./Limiter.js");
const Queue = require("queue-promise");
const limiter = new Limit(95, 70000);
const mojangLimiter = new Limit(600, 600000);
const hypixelLimiter = new Limit(120, 60000);
//const { REST } = require("@discordjs/rest");
//const { Routes } = require("discord-api-types/v9");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const { MongoClient } = require("mongodb");
var cron = require("node-cron");
require("dotenv").config();

// Creates a rate limiting queue
const queue = new Queue({
    concurrent: 1
});

// Prefix to call the bot
const prefix = "src!";
// Determines the token for bot
let token = process.env.token;
let hypixel = process.env.hypixel;
let mongourl = process.env.mongourl;
let src = process.env.srcapi;

// Creates new Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
client.msgCommands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

const msgCommandFiles = fs.readdirSync("./messagecommands").filter(file => file.endsWith(".js"));

for (const file of msgCommandFiles) {
    const command = require(`./messagecommands/${file}`);
    client.msgCommands.set(command.data.name, command);
}

/**
const rest = new REST({ version: '9' }).setToken(token);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(process.env.id),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
*/


const scheduledCommandFiles = fs.readdirSync("./scheduledcommands").filter(file => file.endsWith(".js"));

for (const file of scheduledCommandFiles) {
    const command = require(`./scheduledcommands/${file}`);
    cron.schedule(command.data.interval, () => {
        command.execute(client);
    });
}

// Sets bot activity and announces that bot is ready for use
client.once("ready", async () => {
    client.user.setActivity("speedrun.com | /help", { type: "WATCHING" });
    console.log("Ready!");
});

client.on("messageCreate", async message => {
    // Checks if message starts with the given prefix
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
    console.log(message.content);
    const command = message.content.toLowerCase().slice(4).split(" ");
    if (!client.msgCommands.has(command[0])) return;
    try {
        await client.msgCommands.get(command[0]).execute(command, message);
    } catch (error) {
        console.error(error);
    }
});

client.on("interactionCreate", async interaction => {
    if(interaction.isCommand()) {
        if (!client.commands.has(interaction.commandName)) return;
        await interaction.deferReply();
        try {
            await client.commands.get(interaction.commandName).execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    } else if(interaction.isSelectMenu()) {
        await client.commands.get("hypixel").execute(interaction);
    }
});

client.login(token);

exports.tokens = token;
exports.hypixel = hypixel;
exports.src = src;

exports.limit = function getLimit() {
    return limiter;
};

exports.queue = function getQueue() {
    return queue;
};

exports.fetch = async function limitFetch(text) {
    let data;
    while(true) {
        await limiter.removePoints(1).then(data = await fetch(text).then(response => response.json()));
        if(data.status != 420) {
            return data;
        }
        await sleep(2000);
    }
};

exports.post = async function limitPost(text, params) {
    let data;
    while(true) {
        await limiter.removePoints(1).then(data = await fetch(text, params).then(response => response.json()));
        if(data.status != 420) {
            return data;
        }
        await sleep(2000);
    }
};

exports.fetchMojang = async function limitMojangFetch(text) {
    let data;
    await mojangLimiter.removePoints(1).then(data = await fetch(text).then(response => response.json()).catch(() => ""));
    return data;
};

exports.fetchHypixel = async function limitHypixelFetch(text) {
    let data;
    await hypixelLimiter.removePoints(1).then(data = await fetch(text).then(response => response.json()));
    return data;
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const uri = mongourl;
const dbclient = new MongoClient(uri);
exports.db = dbclient;