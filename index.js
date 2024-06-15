const { OpenAI } = require('openai')
const bot1 = require('./bot-1')
const bot2 = require('./bot-2')
const fetchAllMessages = require('./fetchHistory')
const gptRequest = require('./gptRequest')
const config = require('./config')

const chats = []

const bot1Id = 'asst_CIEbJGcME3XQB8O0Wr18chgm'
const bot2Id = 'asst_8i6WhnQF6OrSEdJ38kprqKtq'

const openai = new OpenAI({
    apiKey: config.OPEN_AI_TOKEN,
});
bot1.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    if (interaction.commandName === 'start') {
        if (chats.filter((c) => c.channelId === interaction.channelId)[0]) {
            await interaction.reply("Another chat has already started here!")
            return
        }

        const thread = await openai.beta.threads.create();
        chats.push({
            channelId: interaction.channelId,
            threadId: thread.id
        })

        await interaction.reply("Started Successfully!")
    }
});

bot1.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return

        if (!chats.filter(x => x.channelId === message.channelId).length) return

        if (message.content.startsWith('!bot2')) return

        const channel = message.channel;

        const threadId = chats.filter(x => x.channelId === message.channelId)[0].threadId

        let firstResponse;

        if (message.content.startsWith('!bot1')) {
            channel.sendTyping()

            firstResponse = await gptRequest(message.content.slice(5), threadId, bot1Id);

            await channel.send(firstResponse.slice(0, 1999))
            return
        }

        if (message.content.startsWith('!bot2')) {
            channel.sendTyping()

            firstResponse = await gptRequest(message.content.slice(5), threadId, bot2Id);

            await channel.send(firstResponse.slice(0, 1999))
            return
        }

        const channel2 = await bot2.channels.fetch(message.channelId)

        channel.sendTyping()
        firstResponse = await gptRequest(message.content, threadId, bot1Id);

        await channel.send(firstResponse.slice(0, 1999));


        channel2.sendTyping()
        let response2 = await gptRequest("Validate and simplifiy the following: " + firstResponse, threadId, bot2Id)

        await channel2.send(response2.slice(0, 1999))
    } catch(e) {
        console.log(e);
    }
})


function getAllHistory(historyRaw) {
    return historyRaw.map((message) => {
        const bot = message.author.bot
        let content = message.content
        const username = message.author.username
        if (content.startsWith("!bot1")) content = content.replace('!bot1', '')
        if (content.startsWith("!bot2")) content = content.replace('!bot2', '')
        return {
            role: bot ? "assistant" : "user",
            content: bot ? username + ": " + content : content
        }
    }).reverse()
}

function removeTheTalker(response) {
    while (response.startsWith('GPT Bot 1: ') || response.startsWith('GPT Bot 2: ')) {
        if (response.startsWith('GPT Bot 1: ')) response = response.replace('GPT Bot 1: ', '')
        if (response.startsWith('GPT Bot 2: ')) response = response.replace('GPT Bot 2: ', '')
    }
    return response
}

// const { OpenAI } = require('openai');
// const config = require('./config');

// const openai = new OpenAI({
//     apiKey: config.OPEN_AI_TOKEN,
// });

// const editAss =async (id, ins) => {
//     await openai.beta.assistants.update(id,
//         {
//             instructions: ins
//         }
//     )
// }

// editAss('asst_8i6WhnQF6OrSEdJ38kprqKtq', 'You')

// async function main() {
//     // const message = await openai.beta.threads.messages.create(
//     //     'thread_vCI1ba9Til22sCeaxR9mdRGA',
//     //     {
//     //         role: "user",
//     //         content: 'can you tell me how to make pancakes?'
//     //     }
//     // );


//     let run = await openai.beta.threads.runs.createAndPoll(
//         'thread_vCI1ba9Til22sCeaxR9mdRGA',
//         {
//             assistant_id: 'asst_8i6WhnQF6OrSEdJ38kprqKtq'
//         }
//     );

//     if (run.status === 'completed') {
//         const messages = await openai.beta.threads.messages.list(
//             run.thread_id
//         );

//         console.log(messages.data[0].content[0].text.value);
//     }


// }

// main();


// async function main() {
//     // const thread = await openai.beta.threads.create();

//     // console.log(thread.id);

//     const message = await openai.beta.threads.messages.create(
//         'thread_fXBQj9TCfzmq7ukxyNdIZzxO',
//         {
//             role: "user",
//             content: "what is my name?"
//         }
//     );

//     let run = await openai.beta.threads.runs.createAndPoll(
//         'thread_fXBQj9TCfzmq7ukxyNdIZzxO',
//         {
//             assistant_id: 'asst_STuFsfBdrQpKwzmf3ygsbxyE'
//         }
//     );

//     if (run.status === 'completed') {
//         const messages = await openai.beta.threads.messages.list(
//             run.thread_id
//         );
//         for (const message of messages.data.reverse()) {
//             console.log(`${message.role} > ${message.content[0].text.value}`);
//         }
//     } else {
//         console.log(run.status);
//     }
// }

// main();