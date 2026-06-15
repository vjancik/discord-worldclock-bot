import { REST, Routes } from "discord.js";
import { loadConfig } from "../src/infrastructure/config/env.ts";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.discordToken);

if (config.guildId !== null) {
	console.log(`Removing guild commands from ${config.guildId}...`);
	await rest.put(
		Routes.applicationGuildCommands(config.clientId, config.guildId),
		{ body: [] },
	);
	console.log("Guild commands removed.");
} else {
	console.log("Removing global commands...");
	await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
	console.log("Global commands removed.");
}
