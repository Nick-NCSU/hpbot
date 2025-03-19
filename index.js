// Imports
const { Client, GatewayIntentBits, Collection, InteractionType, Routes, ActivityType } = require("discord.js");
const fs = require("fs");
const Limit = require("./Limiter.js");
const { REST } = require("@discordjs/rest");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
var cron = require("node-cron");
require("dotenv").config();

// Prefix to call the bot
const prefix = "src!";

let token = process.env.token;
let hypixel = process.env.hypixel;
let src = process.env.srcapi;

const limiter = new Limit(95, 70 * 1000);
const mojangLimiter = new Limit(600, 600 * 1000);
const hypixelLimiter = new Limit(120, 60 * 1000);

// Creates new Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
client.msgCommands = new Collection();
client.guildCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();

getCommands("./CommandInteractions", (command) => {
  client.commands.set(command.data.name, command);
});
getCommands("./GuildCommandInteractions", (command) => {
  client.guildCommands.set(command.data.name, command);
});
getCommands("./SelectMenuInteractions", (command) => {
  client.selectCommands.set(command.data, command);
});
getCommands("./MessageCommands", (command) => {
  client.msgCommands.set(command.data.name, command);
});
getCommands("./ScheduledCommands", (command) => {
  cron.schedule(command.data.interval, () => {
    command.execute(client);
  });
});

function getCommands(dir, callback) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

  for (const file of files) {
    const command = require(`${dir}/${file}`);
    callback(command);
  }
}

const rest = new REST().setToken(token);

// Sets bot activity and announces that bot is ready for use
client.once("ready", async () => {
  client.user.setActivity("speedrun.com | /help", { type: ActivityType.Watching });
    
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(process.env.id, process.env.guildid),
      { body: client.guildCommands.map(command => command.data.toJSON()) },
    );

    const commandValues = new Set((await client.application.commands.fetch()).map(command => command.name));
    const commands = new Set(client.commands.map(command => command.data.name));
    if(commandValues.size !== commands.size || ![...commandValues].every(command => commands.has(command))) {
      await rest.put(
        Routes.applicationCommands(process.env.id),
        { body: client.commands.map(command => command.data.toJSON()) },
      );
      console.log("Successfully reloaded application (/) commands.");
      return;
    }

    console.log("No (/) commands to reload.");
  } catch (error) {
    console.error(error);
  }
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
  await fs.appendFile(
    './data/interactions.txt', 
    `${interaction.user.id}|${interaction.user.username}|${interaction.type}|${interaction.commandName}|${interaction.customId}`
  ).catch(console.error);
  if(interaction.type === InteractionType.ApplicationCommand) {
    if (!client.commands.has(interaction.commandName) && !client.guildCommands.has(interaction.commandName)) return;
    await interaction.deferReply();
    try {
      if(client.commands.has(interaction.commandName)) {
        await client.commands.get(interaction.commandName).execute({
          interaction,
          client
        });
      } else {
        await client.guildCommands.get(interaction.commandName).execute({
          interaction,
          client
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  } else if(interaction.isStringSelectMenu()) {
    if(!client.selectCommands.has(interaction.customId)) return;
    await client.selectCommands.get(interaction.customId).execute({
      interaction,
      client
    });
  } else if(interaction.isButton()) {
    const customId = JSON.parse(interaction.customId).customId;
    if(!client.buttonCommands.has(customId)) return;
    await client.buttonCommands.get(customId).execute({
      interaction,
      client
    });
  }
});

client.login(token);

exports.tokens = token;
exports.hypixel = hypixel;
exports.src = src;

exports.limit = function getLimit() {
  return limiter;
};

exports.fetch = async function limitFetch(text) {
  let attemptCount = 0;
  while(attemptCount++ < 20) {
    await limiter.removePoints(1);
    const response = await fetch(text);
    if(response.status != 420) {
      return await response.json();
    }
    await sleep(2000);
  }
};

exports.post = async function limitPost(text, params) {
  let attemptCount = 0;
  while(attemptCount++ < 20) {
    await limiter.removePoints(1);
    const response = await fetch(text, params);
    if(response.status != 420) {
      return await response.json();
    }
    await sleep(2000);
  }
};

exports.fetchMojang = async function limitMojangFetch(text) {
  await mojangLimiter.removePoints(1);
  const response = await fetch(text);
  try {
    return await response.json();
  } catch (error) {
    // Returns an empty response if the player doesn't exist
    return;
  }
};

exports.fetchHypixel = async function limitHypixelFetch(text) {
  await hypixelLimiter.removePoints(1);
  const response = await fetch(text);
  return await response.json();

};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}