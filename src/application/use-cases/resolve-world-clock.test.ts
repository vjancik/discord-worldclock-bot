import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { MissingLocalRegionError } from "../../domain/errors.ts";
import { Region } from "../../domain/region.ts";
import type { Clock } from "../ports/clock.ts";
import { ResolveWorldClockUseCase } from "./resolve-world-clock.ts";

function fixedClock(isoUtc: string): Clock {
	return {
		nowUtcMillis: () => DateTime.fromISO(isoUtc, { zone: "UTC" }).toMillis(),
	};
}

const tokyo = Region.resolve("Asia/Tokyo");
const london = Region.resolve("Europe/London");
const berlin = Region.resolve("Europe/Berlin");

describe("ResolveWorldClockUseCase", () => {
	test("branch 1: only region → returns current-time result", () => {
		const clock = fixedClock("2026-06-14T12:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		const result = uc.execute({ region: tokyo });
		expect(result.kind).toBe("current-time");
		if (result.kind === "current-time") {
			expect(result.target.ianaId).toBe("Asia/Tokyo");
			expect(result.utcMillis).toBe(clock.nowUtcMillis());
		}
	});

	test("branch 2: region + region_local but no time/date → returns current-time", () => {
		const clock = fixedClock("2026-06-14T12:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		const result = uc.execute({ region: tokyo, regionLocal: london });
		expect(result.kind).toBe("current-time");
	});

	test("branch 3: region + time without region_local → throws MissingLocalRegionError", () => {
		const clock = fixedClock("2026-06-14T12:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		expect(() =>
			uc.execute({ region: tokyo, time: { hour: 17, minute: 0 } }),
		).toThrow(MissingLocalRegionError);
	});

	test("branch 3: region + date without region_local → throws MissingLocalRegionError", () => {
		const clock = fixedClock("2026-06-14T12:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		expect(() =>
			uc.execute({ region: tokyo, date: { year: 2026, month: 6, day: 14 } }),
		).toThrow(MissingLocalRegionError);
	});

	test("branch 4: full conversion with time and date", () => {
		const clock = fixedClock("2026-06-14T12:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		const result = uc.execute({
			region: tokyo,
			regionLocal: london,
			time: { hour: 17, minute: 0 },
			date: { year: 2026, month: 6, day: 14 },
		});
		expect(result.kind).toBe("conversion");
		if (result.kind === "conversion") {
			// London 17:00 BST (UTC+1) → Tokyo JST (UTC+9) = next day 01:00
			const sourceDt = DateTime.fromMillis(result.sourceUtcMillis, {
				zone: "Europe/London",
			});
			const targetDt = DateTime.fromMillis(result.targetUtcMillis, {
				zone: "Asia/Tokyo",
			});
			expect(sourceDt.hour).toBe(17);
			expect(sourceDt.minute).toBe(0);
			expect(targetDt.hour).toBe(1);
			expect(targetDt.day).toBe(15); // next day in Tokyo
		}
	});

	test("branch 4: missing date defaults to today in source zone", () => {
		// Fix clock to June 14 midday UTC → June 14 in London (BST = UTC+1)
		const clock = fixedClock("2026-06-14T11:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		const result = uc.execute({
			region: tokyo,
			regionLocal: berlin,
			time: { hour: 20, minute: 0 },
		});
		expect(result.kind).toBe("conversion");
		if (result.kind === "conversion") {
			const sourceDt = DateTime.fromMillis(result.sourceUtcMillis, {
				zone: "Europe/Berlin",
			});
			expect(sourceDt.day).toBe(14);
			expect(sourceDt.month).toBe(6);
			expect(sourceDt.year).toBe(2026);
		}
	});

	test("branch 4: missing time defaults to current time in source zone", () => {
		// Fix clock to June 14, 15:00 UTC → Berlin CEST is UTC+2 = 17:00
		const clock = fixedClock("2026-06-14T15:00:00Z");
		const uc = new ResolveWorldClockUseCase(clock);
		const result = uc.execute({
			region: tokyo,
			regionLocal: berlin,
			date: { year: 2026, month: 6, day: 14 },
		});
		expect(result.kind).toBe("conversion");
		if (result.kind === "conversion") {
			const sourceDt = DateTime.fromMillis(result.sourceUtcMillis, {
				zone: "Europe/Berlin",
			});
			// Current Berlin time at 15:00 UTC = 17:00 CEST
			expect(sourceDt.hour).toBe(17);
		}
	});
});
