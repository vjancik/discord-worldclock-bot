import { MissingEnvVarError } from "../../domain/errors.ts";

export interface AppConfig {
	discordToken: string;
	clientId: string;
	guildId: string | null;
	nodeEnv: string;
}

function requireEnvVars(names: string[]): Record<string, string> {
	const missing: string[] = [];
	const result: Record<string, string> = {};

	for (const name of names) {
		const value = process.env[name];
		if (value === undefined || value.trim() === "") {
			missing.push(name);
		} else {
			result[name] = value;
		}
	}

	if (missing.length > 0) {
		throw new MissingEnvVarError(missing);
	}

	return result;
}

export function loadConfig(): AppConfig {
	const required = requireEnvVars(["DISCORD_TOKEN", "DISCORD_CLIENT_ID"]);

	return {
		discordToken: required.DISCORD_TOKEN as string,
		clientId: required.DISCORD_CLIENT_ID as string,
		guildId: process.env.GUILD_ID?.trim() ?? null,
		nodeEnv: process.env.NODE_ENV ?? "development",
	};
}
