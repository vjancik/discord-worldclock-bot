import { DateTime } from "luxon";
import type { ParsedDate } from "../../domain/date-input.ts";
import { MissingLocalRegionError } from "../../domain/errors.ts";
import type { Region } from "../../domain/region.ts";
import type { ParsedTime } from "../../domain/time-input.ts";
import { getTzLabel } from "../../domain/tz-label.ts";
import type { Clock } from "../ports/clock.ts";

export interface RegionInfo {
	ianaId: string;
	label: string;
	city: string;
}

export interface CurrentTimeResult {
	kind: "current-time";
	target: RegionInfo;
	utcMillis: number;
}

export interface ConversionResult {
	kind: "conversion";
	source: RegionInfo;
	sourceUtcMillis: number;
	target: RegionInfo;
	targetUtcMillis: number;
}

export type WorldClockResult = CurrentTimeResult | ConversionResult;

function cityName(ianaId: string): string {
	const parts = ianaId.split("/");
	const last = parts[parts.length - 1] ?? ianaId;
	return last.replace(/_/g, " ");
}

function buildRegionInfo(region: Region, dt: DateTime): RegionInfo {
	return {
		ianaId: region.ianaId,
		label: getTzLabel(dt),
		city: cityName(region.ianaId),
	};
}

export class ResolveWorldClockUseCase {
	constructor(private readonly clock: Clock) {}

	execute(params: {
		region: Region;
		regionLocal?: Region | undefined;
		time?: ParsedTime | undefined;
		date?: ParsedDate | undefined;
	}): WorldClockResult {
		const { region, regionLocal, time, date } = params;
		const hasLocalInput = time !== undefined || date !== undefined;

		// Branch 3: time/date provided without region_local → error
		if (hasLocalInput && regionLocal === undefined) {
			throw new MissingLocalRegionError();
		}

		// Branch 1 & 2: no time/date, or region_local present but no time/date
		if (!hasLocalInput) {
			const nowMs = this.clock.nowUtcMillis();
			const targetDt = DateTime.fromMillis(nowMs, { zone: region.ianaId });
			return {
				kind: "current-time",
				target: buildRegionInfo(region, targetDt),
				utcMillis: nowMs,
			};
		}

		// Branch 4: full conversion — regionLocal is defined (guaranteed by branch 3 guard)
		// biome-ignore lint/style/noNonNullAssertion: guaranteed by hasLocalInput + the branch-3 guard above
		const sourceZone = regionLocal!.ianaId;
		const nowMs = this.clock.nowUtcMillis();
		const nowInSource = DateTime.fromMillis(nowMs, { zone: sourceZone });

		// Resolve date: user-supplied or today in source zone
		const resolvedYear = date?.year ?? nowInSource.year;
		const resolvedMonth = date?.month ?? nowInSource.month;
		const resolvedDay = date?.day ?? nowInSource.day;

		// Resolve time: user-supplied or current time in source zone
		const resolvedHour = time?.hour ?? nowInSource.hour;
		const resolvedMinute = time?.minute ?? nowInSource.minute;

		const sourceDt = DateTime.fromObject(
			{
				year: resolvedYear,
				month: resolvedMonth,
				day: resolvedDay,
				hour: resolvedHour,
				minute: resolvedMinute,
				second: 0,
				millisecond: 0,
			},
			{ zone: sourceZone },
		);

		if (!sourceDt.isValid) {
			throw new Error(
				`Could not construct a valid DateTime in zone ${sourceZone}`,
			);
		}

		const sourceMs = sourceDt.toMillis();
		const targetDt = sourceDt.setZone(region.ianaId);
		const targetMs = targetDt.toMillis();

		return {
			kind: "conversion",
			// biome-ignore lint/style/noNonNullAssertion: guaranteed above
			source: buildRegionInfo(regionLocal!, sourceDt),
			sourceUtcMillis: sourceMs,
			target: buildRegionInfo(region, targetDt),
			targetUtcMillis: targetMs,
		};
	}
}
