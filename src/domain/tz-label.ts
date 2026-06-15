import type { DateTime } from "luxon";

// Known long-name → short-abbreviation overrides for cases where initials produce wrong results
const LONG_NAME_OVERRIDES: Record<string, string> = {
	"Central European Standard Time": "CET",
	"Central European Summer Time": "CEST",
	"Australian Eastern Standard Time": "AEST",
	"Australian Eastern Daylight Time": "AEDT",
	"Australian Central Standard Time": "ACST",
	"Australian Central Daylight Time": "ACDT",
	"Australian Western Standard Time": "AWST",
	"New Zealand Standard Time": "NZST",
	"New Zealand Daylight Time": "NZDT",
	"India Standard Time": "IST",
	"Iran Standard Time": "IRST",
	"Iran Daylight Time": "IRDT",
	"Pakistan Standard Time": "PKT",
	"Bangladesh Standard Time": "BST",
	"British Summer Time": "BST",
	"Greenwich Mean Time": "GMT",
	"West Africa Time": "WAT",
	"East Africa Time": "EAT",
	"South Africa Standard Time": "SAST",
	"China Standard Time": "CST",
	"Korea Standard Time": "KST",
	"Japan Standard Time": "JST",
	"Indochina Time": "ICT",
	"Singapore Standard Time": "SGT",
	"Western Indonesia Time": "WIB",
	"Malaysia Standard Time": "MYT",
	"Philippine Standard Time": "PHT",
	"Myanmar Standard Time": "MMT",
	"Nepal Time": "NPT",
	"Sri Lanka Standard Time": "SLST",
	"Afghanistan Time": "AFT",
	"Kazakhstan Standard Time": "ALMT",
	"Turkey Time": "TRT",
	"Arabia Standard Time": "AST",
	"Gulf Standard Time": "GST",
	"Armenia Time": "AMT",
	"Coordinated Universal Time": "UTC",
	"Chamorro Standard Time": "CHST",
	"Hawaii-Aleutian Standard Time": "HAST",
	"Hawaii-Aleutian Daylight Time": "HADT",
	"Alaska Standard Time": "AKST",
	"Alaska Daylight Time": "AKDT",
	"Pacific Standard Time": "PST",
	"Pacific Daylight Time": "PDT",
	"Mountain Standard Time": "MST",
	"Mountain Daylight Time": "MDT",
	"Central Standard Time": "CST",
	"Central Daylight Time": "CDT",
	"Eastern Standard Time": "EST",
	"Eastern Daylight Time": "EDT",
	"Atlantic Standard Time": "AST",
	"Atlantic Daylight Time": "ADT",
	"Newfoundland Standard Time": "NST",
	"Newfoundland Daylight Time": "NDT",
	"Brasilia Standard Time": "BRT",
	"Brasilia Summer Time": "BRST",
	"Argentina Time": "ART",
	"Peru Time": "PET",
	"Chile Standard Time": "CLT",
	"Chile Summer Time": "CLST",
	"Venezuela Time": "VET",
	"Colombia Time": "COT",
	"Ecuador Time": "ECT",
	"Bolivia Time": "BOT",
	"Paraguay Time": "PYT",
	"Uruguay Standard Time": "URT",
	"Cuba Standard Time": "CST",
	"Cuba Daylight Time": "CDT",
	"Moscow Standard Time": "MSK",
	"Further-eastern European Time": "FET",
	"Western European Standard Time": "WET",
	"Western European Summer Time": "WEST",
	"Eastern European Standard Time": "EET",
	"Eastern European Summer Time": "EEST",
};

// Extract initials from the long timezone name (e.g. "Eastern Daylight Time" → "EDT")
function initialsFromLongName(longName: string): string {
	return longName
		.split(" ")
		.map((word) => word[0] ?? "")
		.join("")
		.toUpperCase();
}

function getUtcOffset(dt: DateTime): string {
	const offset = dt.toFormat("ZZ"); // e.g. "+02:00", "+00:00"
	if (offset === "+00:00" || offset === "-00:00") return "UTC";
	return `UTC${offset}`;
}

export function getTzLabel(dt: DateTime): string {
	const ms = dt.toMillis();
	const utcOffset = getUtcOffset(dt);

	// Try the short format first; in environments with full ICU data this gives CEST/EDT etc.
	const short = dt.zone.offsetName(ms, { format: "short", locale: "en-US" });

	// If it's NOT a raw GMT±N style, we have a named abbreviation — append the offset
	if (
		short &&
		!/^GMT[+-]/.test(short) &&
		!/^UTC[+-]/.test(short) &&
		short !== "UTC"
	) {
		return `${short} (${utcOffset})`;
	}

	// Fall back to extracting initials from the long name
	const long = dt.zone.offsetName(ms, { format: "long", locale: "en-US" });
	if (long && long !== "UTC" && long !== short) {
		// Check known overrides first
		const override = LONG_NAME_OVERRIDES[long];
		if (override !== undefined) {
			return `${override} (${utcOffset})`;
		}

		// Otherwise derive initials
		const initials = initialsFromLongName(long);
		// Sanity check: should be 2-5 uppercase letters (e.g. CEST, EDT, IST, AEST)
		if (/^[A-Z]{2,5}$/.test(initials)) {
			return `${initials} (${utcOffset})`;
		}
	}

	// Final fallback: just the UTC offset
	return utcOffset;
}
