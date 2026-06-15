import { SlashCommandBuilder } from "discord.js";

export const worldclockCommand = new SlashCommandBuilder()
	.setName("worldclock")
	.setDescription("Display or convert times across timezones.")
	.addStringOption((option) =>
		option
			.setName("region")
			.setDescription(
				"Target region or timezone (e.g. Tokyo, Europe/London, Japan)",
			)
			.setRequired(true)
			.setAutocomplete(true),
	)
	.addStringOption((option) =>
		option
			.setName("region_local")
			.setDescription(
				"Your local region/timezone — required when providing a time or date",
			)
			.setRequired(false)
			.setAutocomplete(true),
	)
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("Local time in your region (e.g. 5pm, 17:00, 5:30 PM)")
			.setRequired(false),
	)
	.addStringOption((option) =>
		option
			.setName("date")
			.setDescription("Local date in your region (e.g. 2026-06-14, 14.6.2026)")
			.setRequired(false),
	)
	.addBooleanOption((option) =>
		option
			.setName("private")
			.setDescription("Only you can see the reply (default: false)")
			.setRequired(false),
	);

export const commandDefinitions = [worldclockCommand.toJSON()];
