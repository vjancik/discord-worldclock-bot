import type { AutocompleteInteraction } from "discord.js";
import { searchRegionCatalog } from "./region-catalog.ts";

export async function handleWorldClockAutocomplete(
	interaction: AutocompleteInteraction,
): Promise<void> {
	const focused = interaction.options.getFocused(true);

	// Both "region" and "region_local" options use the same catalog
	if (focused.name !== "region" && focused.name !== "region_local") {
		await interaction.respond([]);
		return;
	}

	const matches = searchRegionCatalog(focused.value);
	await interaction.respond(matches.map((m) => ({ name: m, value: m })));
}
