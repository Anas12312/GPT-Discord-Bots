async function fetchAllMessages(channel) {
    let messages = [];
    let lastMessageId;

    while (true) {
        const options = { limit: 100 };
        if (lastMessageId) {
            options.before = lastMessageId;
        }

        const fetchedMessages = await channel.messages.fetch(options);
        if (fetchedMessages.size === 0) {
            break;
        }

        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastMessageId = fetchedMessages.last().id;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Fetched ${messages.length} messages from ${channel.name}`);
    return messages
}

module.exports = fetchAllMessages