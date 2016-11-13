const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const perPage = framework.config.options.commands.queueListPerPage;

Oxyl.registerCommand("queue", "music", (message, bot) => {
	var guild = message.guild;
	const ytInfo = music.data.ytinfo[guild.id];
	const queue = music.data.queue[guild.id];
	const current = music.data.current[guild.id];
	const volume = music.data.volume[guild.id];
	const options = music.data.volume[guild.id];

	if(!current) {
		return `there is no music playing for **${guild.name}**`;
	} else {
		var queueSize = queue.length;
		var page = 1;
		var pageAmount = Math.ceil(queueSize / perPage);

		if(message.content) {
			page = parseInt(message.content);
			if(isNaN(page) || page < 1 || page > pageAmount) {
				return `invalid page number (between 1 and ${pageAmount})`;
			}
		}

		var queueMsg = `Music Info for **${guild.name}**\n`;
		queueMsg += `\nQueue **(${queueSize})**`;

		if(queueSize > 0) {
			let queueSongs = [];
			for(var i = 0; i < perPage; i++) {
				let index = ((page - 1) * perPage) + i;
				let videoId = queue[index];
				let title = ytInfo[videoId].title;

				if(title.length > 75) {
					title = `${title.substring(0, 71)} __**...**__`;
				}

				queueSongs.push(`**[${index + 1}]** ${title}`);
				if(queueSize - 1 === index || i === perPage - 1) break;
			}
			queueSongs = framework.listConstructor(queueSongs);
			queueMsg += `${queueSongs}\nPage ${page} of ${pageAmount}`;
		} else {
			queueMsg += `\nN/A`;
		}

		var infoCurrent = ytInfo[current];
		var videoTitle = infoCurrent.title;
		var videoDuration = music.getDuration(infoCurrent.duration);
		let repeat = options.repeat ? "off" : "on";

		var playTime = music.getPlayTime(message.guild);
		playTime = Math.floor(playTime / 1000);
		playTime = music.getDuration(playTime);

		queueMsg += `\n\nVolume: ${volume}`;
		queueMsg += `\nRepeat: ${repeat}`;
		queueMsg += `\n\nPlaying: ${videoTitle} **(**${playTime}/${videoDuration}**)**`;

		return queueMsg;
	}
}, ["playing", "current"], "List the current guild music queue", "[page]");
