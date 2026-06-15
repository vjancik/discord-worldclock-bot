import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ResolveWorldClockUseCase } from "../../application/use-cases/resolve-world-clock.ts";
import { parseLocalDate } from "../../domain/date-input.ts";
import { AppError } from "../../domain/errors.ts";
import { Region } from "../../domain/region.ts";
import { parseLocalTime } from "../../domain/time-input.ts";
import type { Logger } from "../../infrastructure/logging/logger.ts";
import { formatConversion, formatCurrentTime } from "./format-output.ts";

export class WorldClockHandler {
	constructor(
		private readonly useCase: ResolveWorldClockUseCase,
		private readonly logger: Logger,
	) {}

	async handle(interaction: ChatInputCommandInteraction): Promise<void> {
		const isPrivate = interaction.options.getBoolean("private") ?? false;
		const flags = isPrivate ? MessageFlags.Ephemeral : undefined;

		try {
			const regionInput = interaction.options.getString("region", true);
			const regionLocalInput = interaction.options.getString("region_local");
			const timeInput = interaction.options.getString("time");
			const dateInput = interaction.options.getString("date");

			this.logger.info(
				{
					user: interaction.user.tag,
					guildId: interaction.guildId,
					region: regionInput,
					regionLocal: regionLocalInput,
					time: timeInput,
					date: dateInput,
					private: isPrivate,
				},
				"/worldclock invoked",
			);

			const region = Region.resolve(regionInput);
			const regionLocal =
				regionLocalInput !== null
					? Region.resolve(regionLocalInput)
					: undefined;

			const nowMs = Date.now();

			const parsedTime =
				timeInput !== null ? parseLocalTime(timeInput) : undefined;
			const parsedDate =
				dateInput !== null ? parseLocalDate(dateInput, nowMs) : undefined;

			const result = this.useCase.execute({
				region,
				regionLocal,
				time: parsedTime,
				date: parsedDate,
			});

			let content: string;
			if (result.kind === "current-time") {
				content = formatCurrentTime(result);
			} else {
				content = formatConversion(result);
			}

			await interaction.reply({ content, flags });
		} catch (err) {
			if (err instanceof AppError) {
				await interaction.reply({
					content: `❌ ${err.message}`,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				this.logger.error({ err }, "Unexpected error in /worldclock");
				await interaction.reply({
					content: "❌ An unexpected error occurred. Please try again later.",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
}
