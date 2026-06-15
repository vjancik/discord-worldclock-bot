import { describe, expect, test } from "bun:test";
import { InvalidRegionError } from "./errors.ts";
import { Region } from "./region.ts";

describe("Region.resolve", () => {
	test("resolves exact IANA id case-insensitively", () => {
		expect(Region.resolve("Europe/London").ianaId).toBe("Europe/London");
		expect(Region.resolve("europe/london").ianaId).toBe("Europe/London");
		expect(Region.resolve("EUROPE/LONDON").ianaId).toBe("Europe/London");
	});

	test("resolves city names", () => {
		expect(Region.resolve("Tokyo").ianaId).toBe("Asia/Tokyo");
		expect(Region.resolve("london").ianaId).toBe("Europe/London");
		expect(Region.resolve("new york").ianaId).toBe("America/New_York");
		expect(Region.resolve("Paris").ianaId).toBe("Europe/Paris");
	});

	test("resolves manual country aliases", () => {
		expect(Region.resolve("japan").ianaId).toBe("Asia/Tokyo");
		expect(Region.resolve("uk").ianaId).toBe("Europe/London");
		expect(Region.resolve("Germany").ianaId).toBe("Europe/Berlin");
		expect(Region.resolve("australia").ianaId).toBe("Australia/Sydney");
	});

	test("resolves tz abbreviation aliases", () => {
		expect(Region.resolve("utc").ianaId).toBe("UTC");
		expect(Region.resolve("gmt").ianaId).toBe("Etc/GMT");
		expect(Region.resolve("jst").ianaId).toBe("Asia/Tokyo");
	});

	test("throws InvalidRegionError for unrecognized input", () => {
		expect(() => Region.resolve("Narnia")).toThrow(InvalidRegionError);
		expect(() => Region.resolve("blorp")).toThrow(InvalidRegionError);
	});
});
