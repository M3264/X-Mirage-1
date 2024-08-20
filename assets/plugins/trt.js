const { translate } = require('@vitalets/google-translate-api');
const { command, isPublic } = require('../../lib/');
const config = require('../config');

command(
  {
    pattern: 'trt ?(.*)',
    fromMe: false,
    desc: 'Google Translate',
    dontAddCommandList: false,  // Adjust as needed
  },
  async (message, match) => {
    if (!message.quoted || !message.quoted.text) {
      return await message.reply('_Reply to a text message_\n*Example: trt en|ml*');
    }

    const [to, from] = match.split(' ');
    const targetLang = to || config.LANG;
    const sourceLang = from || 'auto';

    try {
      const translated = await translate(message.quoted.text, { tld: "co.in", to: targetLang, from: sourceLang });
      await message.reply(translated.text);
    } catch (error) {
      await message.reply('_' + error.message + '_');
    }
  }
);