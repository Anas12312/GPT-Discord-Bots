const bot1 = require('./bot-1')
const bot2 = require('./bot-2')
const fetchAllMessages = require('./fetchHistory')
const gptRequest = require('./gptRequest')

bot1.on("messageCreate", async (message) => {
    if (message.author.bot) return
    const channel1 = await bot1.channels.fetch(message.channelId)
    const channel2 = await bot2.channels.fetch(message.channelId)
    const channel = message.channel;
    const historyRaw = await fetchAllMessages(channel)
    const history = getAllHistory(historyRaw)
    message.channel.sendTyping()
    let response = await gptRequest(message.content, history)
    console.log(response)
    const responses = response.split("@@-@@").map(r => r.trim()).filter(r => r.length)
    console.log(responses)
    let index = 0
    sending = false
    while (index < responses.length) {
        const sender = responses[index].slice(8, 9).trim()
        const response = responses[index].slice(10).trim()
        console.log(sender.toLocaleLowerCase())
        if (sender.toLocaleLowerCase() === "1") {
            channel1.sendTyping()
            await channel1.send(response)
        } else if (sender.toLocaleLowerCase() === "2") {
            channel2.sendTyping()
            await channel2.send(response)
        }
        index++;
    }

})


function getAllHistory(historyRaw) {
    return historyRaw.map((message) => {
        const bot = message.author.bot
        const content = message.content
        const username = message.author.username
        return {
            role: bot? "assistant" : "user",
            content: bot? username + ": " + content : content
        }
    }).reverse()
}


const {OpenAI} = require('openai');
const config = require('./config');

const openai = new OpenAI({
    apiKey: config.OPEN_AI_TOKEN,
});

// async function main1() {
//     const assistant = await openai.beta.assistants.create({
//         name: "AZ Test Bot 1",
//         instructions: "Respond as if you are two bots, the first bot is the smart one who retreive the data and respond in pure knowledge, the other bot is a critiacl thinker of the first bot and critice on his response, I want you to write the name of the bot in the first of the response GPT Bot-1 for GPT Bot-1 and GPT Bot-2 for GPT Bot-2 of each response and split between different bot responses with @@-@@",
//         model: "gpt-3.5-turbo"
//     });

//     console.log(assistant);
// }

// main1();


async function main() {
    // const thread = await openai.beta.threads.create();

    // console.log(thread.id);

    const message = await openai.beta.threads.messages.create(
        'thread_fXBQj9TCfzmq7ukxyNdIZzxO',
        {
            role: "user",
            content: "what is my name?"
        }
    );

    let run = await openai.beta.threads.runs.createAndPoll(
        'thread_fXBQj9TCfzmq7ukxyNdIZzxO',
        {
            assistant_id: 'asst_STuFsfBdrQpKwzmf3ygsbxyE'
        }
    );

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
            run.thread_id
        );
        for (const message of messages.data.reverse()) {
            console.log(`${message.role} > ${message.content[0].text.value}`);
        }
    } else {
        console.log(run.status);
    }
}

main();