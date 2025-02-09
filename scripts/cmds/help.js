const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 🐥 | JUNIOR V2 ]"; // changing this wont change the goatbot V2 of list cmd it is just a decoyy

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "destruction", // original author Kshitiz 
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `\n. ∧︵ ∧\n. ᗒ(⟢ω⟣)ᗕ  ★[ᕼᗴᒪᑭ]★》\n╭∪─∪────────⭓\n│●๋ [ ━╬٨ـﮩ𝕌𝕔𝕙𝕚𝕨𝕒𝕓𝕠𝕥ﮩ❤٨ـﮩﮩـ╬━] ●๋\n├───────────⭓`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭───────────⭓\n│ ☢{${category.toUpperCase()} }☢`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 1).map((item) => `❥${item}✰`);
            msg += `\n│${cmds.join(" ".repeat(Math.max(1, 10 - cmds.join("").length)))}`;
          }

          msg += `\n╰───────────⭓`;
        }
      });

      const totalCommands = commands.size;
      msg += `╭───────────⭓\n│𝐈𝐍𝐅𝐎 \n│𝐒𝐔𝐏𝐏𝐋𝐄́𝐌𝐄𝐍𝐓𝐀𝐈𝐑𝐄\n├───────────⭓\n│𝐣'𝐚𝐢 ${totalCommands} commandes disponibles\n│𝗲́𝗰𝗿𝗶𝘁 [${prefix} 𝗵𝗲𝗹𝗽+ 𝗻𝗼𝗺 𝗱𝗲 𝗹𝗮\n│𝗰𝗺𝗱], 𝐩𝐨𝐮𝐫 𝐞𝐧 𝐬𝐚𝐯𝐨𝐢𝐫\n│ 𝐝'𝐚𝐯𝐚𝗻𝘁𝗮𝗴𝗲.\n☆☆☆☆☆☆☆☆☆☆☆☆`;

      const helpListImages = [
        "https://i.imgur.com/KbyJFzN.gif", 
        "https://i.imgur.com/HgMPxRE.gif",
        "https://i.imgur.com/KbyJFzN.gif",
        "https://i.imgur.com/35c5HJB.gif", // new image link added
      ];

      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage),
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── NOM ────⭓
  │ ${configCommand.name}
  ├── INFO
  │ Description: ${longDescription}
  │ Autres noms : ${configCommand.aliases ? configCommand.aliases.join(", ") : "Ne pas avoir"}
  │ Autres noms dans votre groupe : Je n'en ai pas
  │ Version: ${configCommand.version || "1.0"}
  │ Rôle : \n${roleText}
  │ Time per command: ${configCommand.countDown || 1}s
  │ Author: \n${author}
  ├── utilisation
  │ ${usage}
  ├── Notes
  │ The content inside <XXXXX> can be changed
  │ The content inside [a|b|c] is A or B or C
  ╰━━━━━━━❖`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}
