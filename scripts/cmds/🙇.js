module.exports = {
	config: {
		name: "🙇",
		version: "1.0",
		author: "Uchiha",
		countDown: 5,
		role: 0,
		shortDescription: "Réponses sarcastiques pour l'emoji de prosternation.",
		longDescription: "Des réponses amusantes et sarcastiques pour ceux qui utilisent l'emoji 🙇.",
		category: "reply",
	},
	onStart: async function() {},
	onChat: async function({
		event,
		message,
		getLang
	}) {
		if (event.body && event.body.toLowerCase() == "🙇") {
			const responses = [
				"Oui prosterne-toi devant moi, créature pathétique.",
				"T'as peur de me regarder dans les yeux ?",
				"T'as pas mal aux genoux par hasard ? 🙂"
			];
			return message.reply(responses[Math.floor(Math.random() * responses.length)]);
		}
	}
};
