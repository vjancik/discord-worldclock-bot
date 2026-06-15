# Discord World Clock Bot

A Discord app for displaying and converting times across timezones. One slash command, stateless.

## Features

- `/worldclock region:<zone>` — display the current date and time in any timezone
  - Accepts city names (`Tokyo`), country names (`Germany`), common aliases (`UK`, `UAE`, `JST`), or full IANA zone IDs (`America/New_York`)
  - Shows the seasonal timezone abbreviation (CEST, EDT, JST, GMT…) alongside the Discord-formatted timestamp
  - Discord's `<t::F>` timestamp format is used so the exact moment is always unambiguous in older messages
- `/worldclock region:<zone> region_local:<zone> time:<t> date:<d>` — convert a specific local time/date to any target timezone
  - Missing `date` defaults to today in the source timezone; missing `time` defaults to the current time
  - Accepts a wide range of time formats: `5pm`, `5:30 PM`, `17:00`, `17`
  - Accepts a wide range of date formats: `2026-06-14`, `14.6.2026`, `14/6/2026`, `June 14 2026`
- Autocomplete on `region` and `region_local` — prefix-match across cities, countries, and IANA zone IDs
- `private` option — reply ephemerally so only you see the result

## Requirements

- [Bun](https://bun.sh) v1.3+ — or Docker (no host Bun required)
- A Discord application with a bot token

---

## Discord application setup

### 1. Create the application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Give it a name, then open the **Bot** tab.
3. Click **Reset Token** and copy the token — this is your `DISCORD_TOKEN`.
4. Under **Privileged Gateway Intents**, no extra intents are required. The bot only needs the default `Guilds` intent.
5. On the **OAuth2** tab, copy the **Application ID** — this is your `DISCORD_CLIENT_ID`.

### 2. Invite the bot to your server

Use the **OAuth2 → URL Generator** in the Developer Portal. Select the following scopes and permissions:

- **Scopes:** `bot`, `applications.commands`
- **Bot permissions:** `Send Messages`

Copy and open the generated URL to invite the bot to your server.

---

## Configuration

Copy `.env.example` to `.env` and fill in your values:

```env
# Discord bot credentials
DISCORD_TOKEN=your-bot-token-here
DISCORD_CLIENT_ID=your-client-id-here

# Optional: set for guild-scoped command registration (instant propagation, good for dev)
# Omit for global registration (can take up to 1 hour to propagate)
GUILD_ID=

# Set to 'production' for JSON log output, leave as 'development' for pretty logs
NODE_ENV=development
```

---

## Deployment with Docker (recommended)

Docker is the recommended way to host the bot. No host-side Bun installation is needed. The bot is stateless — no volume mount or persistent storage is required.

### 1. Build and start

```bash
docker compose up --build -d
```

### 2. Register slash commands

Run once after the first deploy, or whenever commands change:

```bash
docker compose exec app bun run register-commands
```

### 3. Check logs

```bash
docker compose logs -f app
```

### 4. Stop

```bash
docker compose down
```

---

## Local development (without Docker)

```bash
bun install
cp .env.example .env   # fill in your values
bun run register-commands
bun run dev            # starts with --watch for auto-reload
```

Run tests:

```bash
bun test
```

Type checking and linting:

```bash
bun run typecheck
bun run codecheck:fix
```

---

## Timezone input

The `region` and `region_local` options accept a wide range of inputs:

| Input | Resolves to |
|---|---|
| `Europe/Berlin` | `Europe/Berlin` (exact IANA ID) |
| `Berlin` | `Europe/Berlin` (city name) |
| `New York` | `America/New_York` |
| `Germany` | `Europe/Berlin` |
| `UK` | `Europe/London` |
| `UAE` | `Asia/Dubai` |
| `JST` | `Asia/Tokyo` |
| `UTC` | `UTC` |

If the input cannot be resolved, the bot replies with an ephemeral error. The autocomplete dropdown covers the most common cities, countries, and IANA zone IDs — just start typing.

---

## License

MIT
