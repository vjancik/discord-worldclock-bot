import { describe, expect, test } from "bun:test";
import { TimeParseError } from "./errors.ts";
import { parseLocalTime } from "./time-input.ts";

describe("parseLocalTime", () => {
	test("parses 24h formats", () => {
		expect(parseLocalTime("17:00")).toEqual({ hour: 17, minute: 0 });
		expect(parseLocalTime("09:30")).toEqual({ hour: 9, minute: 30 });
		expect(parseLocalTime("00:00")).toEqual({ hour: 0, minute: 0 });
		expect(parseLocalTime("23:59")).toEqual({ hour: 23, minute: 59 });
	});

	test("parses 12h formats with am/pm", () => {
		expect(parseLocalTime("5pm")).toEqual({ hour: 17, minute: 0 });
		expect(parseLocalTime("5 pm")).toEqual({ hour: 17, minute: 0 });
		expect(parseLocalTime("5:30 PM")).toEqual({ hour: 17, minute: 30 });
		expect(parseLocalTime("5:30pm")).toEqual({ hour: 17, minute: 30 });
		expect(parseLocalTime("12am")).toEqual({ hour: 0, minute: 0 });
		expect(parseLocalTime("12pm")).toEqual({ hour: 12, minute: 0 });
	});

	test("parses bare hour (24h)", () => {
		expect(parseLocalTime("17")).toEqual({ hour: 17, minute: 0 });
		expect(parseLocalTime("9")).toEqual({ hour: 9, minute: 0 });
		expect(parseLocalTime("0")).toEqual({ hour: 0, minute: 0 });
	});

	test("throws TimeParseError for invalid input", () => {
		expect(() => parseLocalTime("not a time")).toThrow(TimeParseError);
		expect(() => parseLocalTime("abc")).toThrow(TimeParseError);
	});
});
