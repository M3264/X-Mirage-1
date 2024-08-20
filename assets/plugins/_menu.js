const plugins = require("../../lib/plugins");
const { command, isPrivate, clockString } = require("../../lib");
const { OWNER_NAME, BOT_NAME } = require("../../config");
const { hostname } = require("os");

command(
  {
    pattern: "menu",
    fromMe: isPrivate,
    desc: "Show All Commands",
    dontAddCommandList: true,
    type: "user",
  },
  async (message, match) => {
    if (match) {
      for (let i of plugins.commands) {
        if (
          i.pattern instanceof RegExp &&
          i.pattern.test(message.prefix + match)
        ) {
          const cmdName = i.pattern.toString().split(/\W+/)[1];
          await message.reply(`\`\`\`Command: ${message.prefix}${cmdName.trim()}
Description: ${i.desc}\`\`\``);
        }
      }
    } else {
      const { prefix } = message;
      const [date, time] = new Date()
        .toLocaleString("en-IN", { timeZone: "Africa/Lagos" })
        .split(",");

      let menu = `*╭━━━━━━━━━━━━━━━━━━━━━ **${BOT_NAME}** ━━━━━━━━━━━━━━━━━━━━━*
┃ *USER*: ${message.pushName}
┃ *OWNER*: ${OWNER_NAME}
┃ *PREFIX*: ${prefix}
┃ *HOST NAME*: ${hostname().split("-")[0]}
┃ *DATE*: ${date}
┃ *TIME*: ${time}
┃ *COMMANDS*: ${plugins.commands.length}
┃ *UPTIME*: ${clockString(process.uptime())}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      let cmnd = [];
      let category = [];

      plugins.commands.forEach((command) => {
        if (command.pattern instanceof RegExp) {
          const cmd = command.pattern.toString().split(/\W+/)[1];
          if (!command.dontAddCommandList && cmd) {
            const type = (command.type || "misc").toLowerCase();
            cmnd.push({ cmd, type });
            if (!category.includes(type)) category.push(type);
          }
        }
      });

      cmnd.sort((a, b) => a.cmd.localeCompare(b.cmd));
      category.sort().forEach((cmmd) => {
        menu += `\n╭─── **${cmmd.toUpperCase()}** ───╮\n`;
        cmnd
          .filter(({ type }) => type === cmmd)
          .forEach(({ cmd }) => {
            menu += `┃ ${cmd.trim()}\n`;
          });
        menu += `╰────────────────────────╯\n`;
      });

      menu += `\n`;
      menu += `_🔖 Send ${prefix}menu <command name> to get detailed information on a specific command._\n*📍Eg:* _${prefix}menu plugin_`;
      return await message.reply(menu);
    }
  }
);


command(
  {
    pattern: "list",
    fromMe: isPrivate,
    desc: "Show All Commands",
    dontAddCommandList: true,
    type: "user",
  },
  async (message) => {
    let menu = "*╭───────────────────────── Command List ─────────────────────────*";

    let cmnd = [];
    plugins.commands.forEach((command) => {
      if (command.pattern) {
        const cmd = command.pattern.toString().split(/\W+/)[1];
        const desc = command.desc || false;

        if (!command.dontAddCommandList && cmd) {
          cmnd.push({ cmd, desc });
        }
      }
    });

    cmnd.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmnd.forEach(({ cmd, desc }, num) => {
      menu += `\n┃ ${num + 1}. ${cmd.trim()} - ${desc ? desc : 'No description'}\n`;
    });

    menu += `╰────────────────────────────────────────────────────────╯`;

    return await message.reply(menu);
  }
);