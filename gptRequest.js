const config = require('./config');

const { OpenAI } = require('openai');

// Set up your OpenAI API key
const openai = new OpenAI({
  apiKey: config.OPEN_AI_TOKEN,
});

// Function to get a response from the GPT model
async function getGPTResponse(prompt, threadId, botId) {
  try {

    const message = await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: prompt
      }
    );

    let run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      {
        assistant_id: botId
      }
    );

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );

      console.log(messages.data[0].content[0].text.value);

      return messages.data[0].content[0].text.value
    } else {
      console.log(run.status);
    }

    


    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [
    //     { role: 'system', content: "You act as two assistant model (GPT Bot-1, GPT Bot-2), the bots may have different opinions,  I need you to generate only one of four cases with the following probability, case 1(5%): GPT Bot-1 only respond, case 2(5%): GPT Bot-2 only respond, case 3(45%): GPT Bot-1 respond then GPT Bot-2 give his opinion on GPT Bot-1 response, case 4(45%): full conversation between GPT Bot-1 and GPT Bot-2 discussing and responding,  I want you to write the name of the bot in the first of the response GPT Bot-1 for GPT Bot-1 and GPT Bot-2 for GPT Bot-2 of each response and split between different bot responses with @@-@@" },
    //     ...history,
    //     { role: 'user', content: prompt },

    //   ],
    // });
    // console.log(response)
    // return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

module.exports = async (prompt, threadId) => {
  const response = await getGPTResponse(prompt, threadId);
  // console.log('GPT-3.5 Response:', response);
  return response
}