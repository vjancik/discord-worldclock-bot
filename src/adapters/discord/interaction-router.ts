import type { Client } from "discord.js";
import { Events, MessageFlags } from "discord.js";
import type { Logger } from "../../infrastructure/logging/logger.ts";
import { handleWorldClockAutocomplete } from "./worldclock.autocomplete.ts";
import type { WorldClockHandler } from "./worldclock.handler.ts";

export function registerInteractionRouter(
	client: Client,
	worldClockHandler: WorldClockHandler,
	logger: Logger,
): void {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (interaction.isAutocomplete()) {
			if (interaction.commandName === "worldclock") {
				try {
					await handleWorldClockAutocomplete(interaction);
				} catch (err) {
					logger.error({ err }, "Autocomplete error");
				}
			}
			return;
		}

		if (!interaction.isChatInputCommand()) return;

		try {
			if (interaction.commandName === "worldclock") {
				await worldClockHandler.handle(interaction);
			}
		} catch (err) {
			logger.error(
				{ err, commandName: interaction.commandName },
				"Unhandled error in interaction",
			);
			if (!interaction.replied && !interaction.deferred) {
				await interaction
					.reply({
						content: "❌ An unexpected error occurred. Please try again later.",
						flags: MessageFlags.Ephemeral,
					})
					.catch(() => undefined);
			}
		}
	});
}
