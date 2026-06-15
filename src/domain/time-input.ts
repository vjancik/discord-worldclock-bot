import * as chrono from "chrono-node";
import { DateTime } from "luxon";
import { TimeParseError } from "./errors.ts";

export interface ParsedTime {
	hour: number;
	minute: number;
}

// Bare hour formats chrono doesn't handle: "17", "9", "09"
const BARE_HOUR_RE = /^(\d{1,2})$/;

export function parseLocalTime(input: string): ParsedTime {
	const trimmed = input.trim();

	// Try bare hour first ("17", "9") via Luxon
	const bareMatch = BARE_HOUR_RE.exec(trimmed);
	if (bareMatch !== null) {
		const dt = DateTime.fromFormat(bareMatch[1] as string, "H");
		if (dt.isValid) {
			return { hour: dt.hour, minute: 0 };
		}
	}

	// Use a fixed reference date so chrono anchors only on the time component
	const ref = new Date("2000-01-01T00:00:00Z");
	const result = chrono.parseDate(trimmed, ref);

	if (result === null) {
		throw new TimeParseError(input);
	}

	return { hour: result.getHours(), minute: result.getMinutes() };
}
