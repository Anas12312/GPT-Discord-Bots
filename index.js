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