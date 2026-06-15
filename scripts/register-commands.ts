import { REST, Routes } from "discord.js";
import { commandDefinitions } from "../src/adapters/discord/command-definitions.ts";
import { loadConfig } from "../src/infrastructure/config/env.ts";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.discordToken);

if (config.guildId !== null) {
	console.log(`Registering commands to guild ${config.guildId} (instant)...`);
	await rest.put(
		Routes.applicationGuildCommands(config.clientId, config.guildId),
		{
			body: commandDefinitions,
		},
	);
	console.log("Guild commands registered.");
} else {
	console.log(
		"Registering global commands (may take up to 1h to propagate)...",
	);
	await rest.put(Routes.applicationCommands(config.clientId), {
		body: commandDefinitions,
	});
	console.log("Global commands registered.");
}
