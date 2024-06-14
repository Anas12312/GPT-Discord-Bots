const { CLIENT_ID, TOKEN } = require("./config");

const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'start',
        description: 'Starts a new conversation with bots in this channel'
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function run() {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}
run()


const { Client, GatewayIntentBits } = require('discord.js');
const fetchAllMessages = require("./fetchHistory");
const gptRequest = require("./gptRequest");
const { OpenAI } = require("openai");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});




module.exports = client
client.login(TOKEN);