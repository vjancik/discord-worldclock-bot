import pino from "pino";

export type Logger = pino.Logger;

export function createLogger(nodeEnv: string): Logger {
	const isDev = nodeEnv !== "production";

	return pino(
		isDev
			? {
					level: "debug",
					transport: {
						target: "pino-pretty",
						options: { colorize: true },
					},
				}
			: { level: "info" },
	);
}
