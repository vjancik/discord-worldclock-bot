import { describe, expect, test } from "bun:test";
import { parseLocalDate } from "./date-input.ts";
import { DateParseError } from "./errors.ts";

const NOW = new Date("2026-06-15T12:00:00Z").getTime();

describe("parseLocalDate", () => {
	test("parses ISO format", () => {
		expect(parseLocalDate("2026-06-14", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 14,
		});
	});

	test("parses dot-separated format", () => {
		expect(parseLocalDate("14.6.2026", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 14,
		});
	});

	test("parses Japanese slash format", () => {
		expect(parseLocalDate("2026/6/15", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 15,
		});
	});

	test("parses M/d/yyyy (US)", () => {
		expect(parseLocalDate("6/14/2026", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 14,
		});
	});

	test("parses written month formats", () => {
		expect(parseLocalDate("June 14 2026", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 14,
		});
		expect(parseLocalDate("14 June", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 14,
		});
		expect(parseLocalDate("Jun 15", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 15,
		});
	});

	test("parses ambiguous M/d slash as month/day", () => {
		// 6/8 → June 8, not August 6
		expect(parseLocalDate("6/8", NOW)).toEqual({
			year: 2026,
			month: 6,
			day: 8,
		});
	});

	test("throws DateParseError for invalid input", () => {
		expect(() => parseLocalDate("not a date", NOW)).toThrow(DateParseError);
		expect(() => parseLocalDate("abc", NOW)).toThrow(DateParseError);
	});
});
