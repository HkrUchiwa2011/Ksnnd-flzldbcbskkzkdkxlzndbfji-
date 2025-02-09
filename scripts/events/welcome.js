const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
  global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "1.7",
    author: "NTKhang",
    category: "events"
  },

  langs: {
    vi: {
      session1: "sáng",
      session2: "trưa",
      session3: "chiều",
      session4: "tối",
      welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
      multiple1: "bạn",
      multiple2: "các bạn",
      defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
    },
    en: {
      session1: "🏌️‍♂️",
      session2: "😐 ",
      session3: "🏌️‍♂️",
      session4: "😗😗",
      welcomeMessage: "╭───────────Ꙭ\n┊Je peux savoir le con qui m'a ajouté dans ce groupe pourri\n┊Merde c'est qui cet idiot ?\n┊Brerf comme vous êtes nul je vous aide.┊𝕌𝕥𝕝𝕚𝕤𝕖𝕫 𝕞𝕠𝕟 𝕡𝕣𝕖𝕗𝕚𝕩:【%1】\n┊𝗣𝗼𝘂𝗿 𝗮𝗳𝗳𝗶𝗰𝗵𝗲𝗿 𝗹𝗮 𝗹𝗶𝘀𝘁𝗲\n┊𝗱𝗲𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝗲𝘀, 𝘃𝗲𝘂𝗶𝗹𝗹𝗲𝘇\n┊𝘀𝗮𝗶𝘀𝗶𝗿: %1𝗵𝗲𝗹𝗽\n╰───────────Ꙭ",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `━╬٨ـﮩ𝕌𝕔𝕙𝕚𝕨𝕒𝔹𝕠𝕥❤٨ـﮩﮩـ╬━]\n▬▬▬▬▬▬▬▬▬▬▬▬\n Mal venue {userName}\n𝗕ienvenue en enfer ou plutôt dans le groupe pourri :{boxName} 𝗲𝘁 passe une mauvaise journée  {session} 😗 `
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType == "log:subscribe")
      return async function () {
        const hours = getTime("HH");
        const { threadID } = event;
        const { nickNameBot } = global.GoatBot.config;
        const prefix = global.utils.getPrefix(threadID);
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        // Si un nouveau membre est le bot
        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
          if (nickNameBot)
            api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());

          // Envoi du message de confirmation avec le GIF
          const confirmationGif = "https://i.imgur.com/oiBp2al.gif"; // GIF de confirmation
          const confirmationMessage = getLang("welcomeMessage", prefix); // Message de bienvenue

          return message.send({
            body: confirmationMessage,
            attachment: await global.utils.getStreamFromURL(confirmationGif), // Attache le GIF de confirmation
          });
        }

        // Si un nouveau membre rejoint (et ce n'est pas le bot)
        if (!global.temp.welcomeEvent[threadID])
          global.temp.welcomeEvent[threadID] = {
            joinTimeout: null,
            dataAddedParticipants: []
          };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
          const threadData = await threadsData.get(threadID);
          if (threadData.settings.sendWelcomeMessage == false)
            return;

          const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
          const dataBanned = threadData.data.banned_ban || [];
          const threadName = threadData.threadName;
          const userName = [], mentions = [];
          let multiple = false;

          if (dataAddedParticipants.length > 1)
            multiple = true;

          for (const user of dataAddedParticipants) {
            if (dataBanned.some((item) => item.id == user.userFbId))
              continue;
            userName.push(user.fullName);
            mentions.push({
              tag: user.fullName,
              id: user.userFbId
            });
          }

          if (userName.length == 0) return;

          let { welcomeMessage = getLang("defaultWelcomeMessage") } =
            threadData.data;

          const form = {
            mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
          };
          welcomeMessage = welcomeMessage
            .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
            .replace(/\{boxName\}|\{threadName\}/g, threadName)
            .replace(
              /\{multiple\}/g,
              multiple ? getLang("multiple2") : getLang("multiple1")
            )
            .replace(
              /\{session\}/g,
              hours <= 10
                ? getLang("session1")
                : hours <= 12
                  ? getLang("session2")
                  : hours <= 18
                    ? getLang("session3")
                    : getLang("session4")
            );

          form.body = welcomeMessage;

          // Liste des GIFs de bienvenue
          const welcomeGifs = [
            "https://i.imgur.com/hDDJdrC.gif", // GIF actuel
            "https://i.imgur.com/YkLcDRv.gif"  // Nouveau GIF
          ];

          // Choix aléatoire d'un GIF de bienvenue
          const randomGif = welcomeGifs[Math.floor(Math.random() * welcomeGifs.length)];

          // Attacher le GIF choisi aléatoirement
          form.attachment = await global.utils.getStreamFromURL(randomGif);

          if (threadData.data.welcomeAttachment) {
            const files = threadData.data.welcomeAttachment;
            const attachments = files.reduce((acc, file) => {
              acc.push(drive.getFile(file, "stream"));
              return acc;
            }, []);
            form.attachment = (await Promise.allSettled(attachments))
              .filter(({ status }) => status == "fulfilled")
              .map(({ value }) => value);
          }

          message.send(form);
          delete global.temp.welcomeEvent[threadID];
        }, 1500);
      };
  }
};
