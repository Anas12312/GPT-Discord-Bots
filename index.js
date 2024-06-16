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

        console.log(threadId);

        let firstResponse;

        if (message.content.startsWith('!bot1')) {

            if (message.content.startsWith('!bot1 !x')) {

                channel.sendTyping()

                firstResponse = await gptRequest(message.content.slice(7), threadId, bot1Id);

                await channel.send(firstResponse.slice(0, 1999))

                await openai.beta.threads.messages.create(
                    threadId,
                    {
                        role: 'user',
                        content: 'Bot-1 Says: ' + firstResponse
                    }
                );

                const secRespone = await gptRequest(firstResponse, threadId, bot2Id);

                const channel2 = await bot2.channels.fetch(message.channelId)

                channel2.sendTyping()

                await channel2.send(secRespone.slice(0, 1999))

                return
            }

            channel.sendTyping()

            firstResponse = await gptRequest(message.content.slice(5), threadId, bot1Id);

            await channel.send(firstResponse.slice(0, 1999))
            return
        }

        
        return
    } catch (e) {
        console.log(e);
    }
})


bot2.on("messageCreate", async (message) => {
    try {

        if (message.author.bot) return

        if (!chats.filter(x => x.channelId === message.channelId).length) return

        if (message.content.startsWith('!bot1')) return

        const channel = message.channel;

        const threadId = chats.filter(x => x.channelId === message.channelId)[0].threadId

        console.log(threadId);

        let firstResponse;

        if (message.content.startsWith('!bot2')) {

            if (message.content.startsWith('!bot2 !x')) {

                channel.sendTyping()

                await openai.beta.threads.messages.create(
                    threadId,
                    {
                        role: 'user',
                        content: 'Bot-1 Says: ' + ((await openai.beta.threads.messages.list(threadId)).data.filter(x => x.assistant_id === bot1Id)[0].content[0].text)
                    }
                );

                firstResponse = await gptRequest(message.content.slice(7), threadId, bot2Id);

                await channel.send(firstResponse.slice(0, 1999))

                return
            }

            channel.sendTyping()

            firstResponse = await gptRequest(message.content.slice(5), threadId, bot2Id);

            await channel.send(firstResponse.slice(0, 1999))
            return
        }

        return

    } catch (e) {
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

//     const ass = await openai.beta.assistants.retrieve('asst_CIEbJGcME3XQB8O0Wr18chgm');

//     console.log(ass.instructions);

//     const ass1 = await openai.beta.assistants.retrieve('asst_8i6WhnQF6OrSEdJ38kprqKtq');

//     console.log(ass1.instructions);

//     await editAss('asst_CIEbJGcME3XQB8O0Wr18chgm', 'Your name is Bot-1')

//     await editAss('asst_8i6WhnQF6OrSEdJ38kprqKtq',
//         'Your name is Bot-2, there is other bot called Bot-1, Bot-1 will say information you respond with your opinion about that informations.'
//     )
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