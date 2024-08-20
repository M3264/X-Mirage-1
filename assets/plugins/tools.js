const {
  command,
  qrcode,
  Bitly,
  isPrivate,
  isPublic,
  isUrl,
  readQr,
} = require("../../lib/");
const fetch = require('node-fetch');  // Import fetch for HTTP requests

const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { getLyrics } = require("../../lib/functions");
const config = require("../../config");
command(
  {
    pattern: "vv",
    fromMe: isPrivate,
    desc: "Forwards The View once messsage",
    type: "tool",
  },
  async (message, match, m) => {
    let buff = await m.quoted.download();
    return await message.sendFile(buff);
  }
);

// STATUS SAVER ( MAKE fromMe: false TO USE AS PUBLIC )
command(
  {
    on: "text",
    fromMe: !config.STATUS_SAVER,
    desc: "Save or Give Status Updates",
    dontAddCommandList: true,
    type: "Tool",
  },
  async (message, match, m) => {
    try {
      if (message.isGroup) return;
      const triggerKeywords = ["save", "send", "sent", "snt", "give", "snd"];
      const cmdz = match.toLowerCase().split(" ")[0];
      if (triggerKeywords.some((tr) => cmdz.includes(tr))) {
        const relayOptions = { messageId: m.quoted.key.id };
        return await message.client.relayMessage(
          message.jid,
          m.quoted.message,
          relayOptions
        );
      }
    } catch (error) {
      console.error("[Error]:", error);
    }
  }
);

command(
  {
    pattern: "qr",
    fromMe: isPrivate,
    desc: "Read/Write Qr.",
    type: "Tool",
  },
  async (message, match, m) => {
    match = match || message.reply_message.text;

    if (match) {
      let buff = await qrcode(match);
      return await message.sendMessage(message.jid, buff, {}, "image");
    } else if (message.reply_message.image) {
      const buffer = await m.quoted.download();
      readQr(buffer)
        .then(async (data) => {
          return await message.sendMessage(message.jid, data);
        })
        .catch(async (error) => {
          console.error("Error:", error.message);
          return await message.sendMessage(message.jid, error.message);
        });
    } else {
      return await message.sendMessage(
        message.jid,
        "*Example : qr test*\n*Reply to a qr image.*"
      );
    }
  }
);

command(
  {
    pattern: "bitly",
    fromMe: isPrivate,
    desc: "Converts Url to bitly",
    type: "tool",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Reply to a url or enter a url_");
    if (!isUrl(match)) return await message.reply("_Not a url_");
    let short = await Bitly(match);
    return await message.reply(short.link);
  }
);

command(
  {
    pattern: "lyric",
    fromMe: isPrivate,
    desc: "Searches for lyrics based on the format: song;artist",
    type: "tools",
  },
  async (message, match) => {
    const [song, artist] = match.split(";").map((item) => item.trim());
    if (!song || !artist) {
      await message.reply("Search with this format: \n\t_lyric song;artist_");
    } else {
      try {
        const data = await getLyrics(song, artist);
        if (data) {
          return await message.reply(
            `*Artist:* ${data.artist_name}\n*Song:* ${
              data.song
            }\n*Lyrics:*\n${data.lyrics.trim()}`
          );
        } else {
          return await message.reply(
            "No lyrics found for this song by this artist."
          );
        }
      } catch (error) {
        return await message.reply("An error occurred while fetching lyrics.");
      }
    }
  }
);

command(
  {
    pattern: "gitclone",
    fromMe: isPublic,  // Check if the command should be available in private chats only
    desc: "To download a repository file",
    type: "user",
  },
  async (message, match) => {
    const args = match.split(' ');

    // Check if a GitHub link is provided
    if (!args[0]) {
      return await message.reply(`*• Example:* ${prefix + 'gitclone'} https://github.com/M3264/X-Mirage`);
    }

    // Validate the GitHub URL
    if (!isUrl(args[0]) || !args[0].includes('github.com')) {
      return await message.reply(`Invalid link!!`);
    }

    try {
      // Extract user and repo from the GitHub URL using regex
      let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
      let [, user, repo] = args[0].match(regex1) || [];
      if (!user || !repo) {
        return await message.reply(`Couldn't extract repo details. Make sure the URL is correct.`);
      }

      // Remove the .git extension if present
      repo = repo.replace(/.git$/, '');

      // Construct the API URL for the zipball
      let url = `https://api.github.com/repos/${user}/${repo}/zipball`;

      // Fetch the filename from the response headers
      let response = await fetch(url, { method: 'HEAD' });
      let filename = response.headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];

      // Send the zip file as a document
      await message.sendMessage(
        message.chat,
        { document: { url: url }, fileName: filename + '.zip', mimetype: 'application/zip' },
        { quoted: message }
      );

    } catch (err) {
      console.error(err);
      return await message.reply(`Error: Unable to download the repository. Please try again later.`);
    }
  }
);