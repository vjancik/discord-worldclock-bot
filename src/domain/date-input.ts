import * as chrono from "chrono-node";
import { DateParseError } from "./errors.ts";

export interface ParsedDate {
	year: number;
	month: number;
	day: number;
}

export function parseLocalDate(input: string, nowMs: number): ParsedDate {
	const ref = new Date(nowMs);
	const result = chrono.parseDate(input.trim(), ref, { forwardDate: false });

	if (result === null) {
		throw new DateParseError(input);
	}

	return {
		year: result.getFullYear(),
		month: result.getMonth() + 1,
		day: result.getDate(),
	};
}
