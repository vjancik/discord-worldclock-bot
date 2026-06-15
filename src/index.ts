import { Events } from "discord.js";
import { createDiscordClient } from "./adapters/discord/client.ts";
import { registerInteractionRouter } from "./adapters/discord/interaction-router.ts";
import { WorldClockHandler } from "./adapters/discord/worldclock.handler.ts";
import { ResolveWorldClockUseCase } from "./application/use-cases/resolve-world-clock.ts";
import { loadConfig } from "./infrastructure/config/env.ts";
import { createLogger } from "./infrastructure/logging/logger.ts";
import { SystemClock } from "./infrastructure/system-clock.ts";

const config = loadConfig();
const logger = createLogger(config.nodeEnv);

const clock = new SystemClock();
const useCase = new ResolveWorldClockUseCase(clock);
const worldClockHandler = new WorldClockHandler(useCase, logger);

const client = createDiscordClient();
registerInteractionRouter(client, worldClockHandler, logger);

client.once(Events.ClientReady, (c) => {
	logger.info(`Logged in as ${c.user.tag}`);
});

await client.login(config.discordToken);
