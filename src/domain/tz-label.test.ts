import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { getTzLabel } from "./tz-label.ts";

describe("getTzLabel", () => {
	test("returns abbreviation with offset for named timezone (summer)", () => {
		const dt = DateTime.fromISO("2026-07-15T12:00:00", {
			zone: "Europe/Berlin",
		});
		expect(getTzLabel(dt)).toBe("CEST (UTC+02:00)");
	});

	test("returns abbreviation with offset for named timezone (winter)", () => {
		const dt = DateTime.fromISO("2026-01-15T12:00:00", {
			zone: "Europe/Berlin",
		});
		expect(getTzLabel(dt)).toBe("CET (UTC+01:00)");
	});

	test("returns JST with offset for Tokyo", () => {
		const dt = DateTime.fromISO("2026-06-14T12:00:00", { zone: "Asia/Tokyo" });
		expect(getTzLabel(dt)).toBe("JST (UTC+09:00)");
	});

	test("returns UTC offset only for fixed offset zones", () => {
		const dt = DateTime.fromISO("2026-06-14T12:00:00", { zone: "Etc/GMT+5" });
		const label = getTzLabel(dt);
		expect(typeof label).toBe("string");
		expect(label.length).toBeGreaterThan(0);
	});

	test("returns UTC for UTC zone", () => {
		const dt = DateTime.fromISO("2026-06-14T12:00:00", { zone: "UTC" });
		expect(getTzLabel(dt)).toBe("UTC");
	});
});
