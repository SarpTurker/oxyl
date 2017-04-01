const rethinkdbdash = require("rethinkdbdash");
module.exports = {
	init: async () => {
		let connectionInfo = bot.privateConfig.database;
		connectionInfo.silent = true;
		connectionInfo.db = "Oxyl";
		global.r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		let dbs = await r.dbList().run();
		if(!~dbs.indexOf("Oxyl")) {
			console.info("Creating database Oxyl...");
			await r.dbCreate("Oxyl").run();
		}

		let tableList = await r.tableList().run();
		let tablesExpected = [
			"autoRole", "blacklist", "editedCommands",
			"ignoredChannels", "modLog", "musicCache",
			"roleMe", "settings", "timedEvents"
		];

		for(let table of tablesExpected) {
			if(!~tableList.indexOf(table)) {
				console.info(`Creating "${table}" table...`);
				await r.tableCreate(table).run();
			}
		}
		console.startup("RethinkDB successfully started");

		let prefixes = await r.table("settings").filter({ name: "prefix" }).run();
		console.info(`Grabbing prefixes to store in cache... ${prefixes.length} found`);
		prefixes.forEach(setting => bot.prefixes.set(setting.guildID, setting.value));
	}
};

module.exports.init();
