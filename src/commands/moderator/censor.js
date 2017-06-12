module.exports = {
	process: async message => {
		message.args[0] = message.args[0].toLowerCase();
		message.args[1] = message.args[1].toLowerCase();
		if(message.args[0] === "add") {
			if(!message.args[1]) {
				return __("commands.moderator.censor.add.noAction", message);
			} else if(!~["none", "warn", "kick", "softban", "ban"].indexOf(message.args[1])) {
				return __("commands.moderator.censor.add.invalidAction", message);
			} else if(!message.args[2]) {
				return __("commands.moderator.censor.add.noRegex", message);
			} else {
				let censors = await r.table("censors").filter({ guildID: message.channel.guild.id }).run(), id = 1;
				if(censors.length) id = Math.max(...censors.map(censor => censor.censorID)) + 1;

				let censorsCache = bot.censors.get(message.channel.guild.id);
				if(censorsCache) {
					censorsCache.set(id, { action: message.args[1], regex: message.args[2] });
				} else {
					bot.censors.set(message.channel.guild.id, new Map())
						.get(message.channel.guild.id)
						.set(id, { action: message.args[1], regex: message.args[2] });
				}

				await r.table("censors").insert({
					action: message.args[1],
					censorID: id,
					guildID: message.channel.guild.id,
					regex: message.args[2]
				}).run();
				return __("commands.moderator.censor.add.success", message);
			}
		} else if(message.args[0] === "delete" || message.args[0] === "remove") {
			if(!message.args[1]) return __("commands.moderator.censor.delete.noID", message);

			let id = parseInt(message.args[1]);
			if(isNaN(id) || id < 1) {
				return __("commands.moderator.censor.delete.invalidID", message);
			} else {
				let censor = await r.table("censors")
					.filter({ guildID: message.channel.guild.id, censorID: id }).delete().run();

				if(censor.deleted) {
					let censorsCache = bot.censors.get(message.channel.guild.id);
					if(censorsCache.size === 1) bot.censors.delete(message.channel.guild.id);
					else censorsCache.delete(id);

					return __("commands.moderator.censor.delete.success", message);
				} else {
					return __("commands.moderator.censor.delete.noCensorFound", message);
				}
			}
		} else if(message.args[0] === "list") {
			let censors = await r.table("censors").filter({ guildID: message.channel.guild.id }).run();
			if(!censors.length) {
				return __("commands.moderator.censor.list.noCensors", message);
			} else {
				return __("commands.moderator.censor.list.success", message,
					{ censors: censors.map(cen => `${cen.censorID}. ${cen.regex} (${cen.action})`).join("\n") });
			}
		} else {
			return __("commands.moderator.censor.invalidSubcommand", message);
		}
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "manageServer",
	description: "Add or remove censors",
	args: [{
		type: "text",
		label: "add|delete|list"
	}, {
		type: "text",
		label: "action|id",
		optional: true
	}, {
		type: "text",
		label: "regex",
		optional: true
	}]
};
