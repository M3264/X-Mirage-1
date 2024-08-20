const { isPrivate } = require('./lib');  // Import visibility controls
const fetch = require('node-fetch');  // Import fetch if necessary
const config = require("../config");
const prefix = config.HANDLERS;

command(
  {
    pattern: "ai",
    fromMe: isPublic,  // Check if the command should only be available in private chats
    desc: "Ask anything from GPT-4",
    type: "user",
  },
  async (message, match) => {
    // Extract the query from the message
    const text = match.trim();

    // Check if a query is provided
    if (!text) {
      return await message.reply(`*• Example:* ${prefix + 'ai'} what is your name`);
    }

    try {
      // Fetch the response from the GPT-4 API
      let response = await fetch(`https://itzpire.com/ai/gpt?model=gpt-4&q=${encodeURIComponent(text)}`);
      let gpt = await response.json();

      // Check if the response is valid
      if (gpt && gpt.answer) {
        // Send the GPT-4 response to the chat
        await message.reply(gpt.answer);
      } else {
        // Handle unexpected response
        await message.reply(`Sorry, I couldn't fetch a valid response. Please try again later.`);
      }

    } catch (err) {
      console.error(err);
      return await message.reply(`Error: Unable to connect to the AI service. Please try again later.`);
    }
  }
);