import { InvalidRegionError } from "./errors.ts";

// Country/region aliases that aren't IANA ids or city names
const MANUAL_ALIASES: Record<string, string> = {
	uk: "Europe/London",
	england: "Europe/London",
	britain: "Europe/London",
	"great britain": "Europe/London",
	scotland: "Europe/London",
	wales: "Europe/London",
	ireland: "Europe/Dublin",
	czechia: "Europe/Prague",
	"czech republic": "Europe/Prague",
	netherlands: "Europe/Amsterdam",
	holland: "Europe/Amsterdam",
	"south korea": "Asia/Seoul",
	korea: "Asia/Seoul",
	"north korea": "Asia/Pyongyang",
	uae: "Asia/Dubai",
	"united arab emirates": "Asia/Dubai",
	usa: "America/New_York",
	"united states": "America/New_York",
	us: "America/New_York",
	canada: "America/Toronto",
	australia: "Australia/Sydney",
	"new zealand": "Pacific/Auckland",
	nz: "Pacific/Auckland",
	russia: "Europe/Moscow",
	china: "Asia/Shanghai",
	india: "Asia/Kolkata",
	japan: "Asia/Tokyo",
	brazil: "America/Sao_Paulo",
	mexico: "America/Mexico_City",
	argentina: "America/Argentina/Buenos_Aires",
	egypt: "Africa/Cairo",
	"south africa": "Africa/Johannesburg",
	nigeria: "Africa/Lagos",
	kenya: "Africa/Nairobi",
	israel: "Asia/Jerusalem",
	turkey: "Europe/Istanbul",
	ukraine: "Europe/Kyiv",
	poland: "Europe/Warsaw",
	germany: "Europe/Berlin",
	france: "Europe/Paris",
	spain: "Europe/Madrid",
	italy: "Europe/Rome",
	switzerland: "Europe/Zurich",
	sweden: "Europe/Stockholm",
	norway: "Europe/Oslo",
	denmark: "Europe/Copenhagen",
	finland: "Europe/Helsinki",
	austria: "Europe/Vienna",
	belgium: "Europe/Brussels",
	portugal: "Europe/Lisbon",
	greece: "Europe/Athens",
	romania: "Europe/Bucharest",
	hungary: "Europe/Budapest",
	slovakia: "Europe/Bratislava",
	croatia: "Europe/Zagreb",
	serbia: "Europe/Belgrade",
	bulgaria: "Europe/Sofia",
	estonia: "Europe/Tallinn",
	latvia: "Europe/Riga",
	lithuania: "Europe/Vilnius",
	vietnam: "Asia/Ho_Chi_Minh",
	thailand: "Asia/Bangkok",
	indonesia: "Asia/Jakarta",
	malaysia: "Asia/Kuala_Lumpur",
	singapore: "Asia/Singapore",
	philippines: "Asia/Manila",
	pakistan: "Asia/Karachi",
	bangladesh: "Asia/Dhaka",
	myanmar: "Asia/Rangoon",
	cambodia: "Asia/Phnom_Penh",
	laos: "Asia/Vientiane",
	nepal: "Asia/Kathmandu",
	"sri lanka": "Asia/Colombo",
	iran: "Asia/Tehran",
	iraq: "Asia/Baghdad",
	"saudi arabia": "Asia/Riyadh",
	jordan: "Asia/Amman",
	kuwait: "Asia/Kuwait",
	qatar: "Asia/Qatar",
	bahrain: "Asia/Bahrain",
	oman: "Asia/Muscat",
	kazakhstan: "Asia/Almaty",
	uzbekistan: "Asia/Tashkent",
	afghanistan: "Asia/Kabul",
	mongolia: "Asia/Ulaanbaatar",
	taiwan: "Asia/Taipei",
	"hong kong": "Asia/Hong_Kong",
	macau: "Asia/Macau",
	morocco: "Africa/Casablanca",
	ghana: "Africa/Accra",
	ethiopia: "Africa/Addis_Ababa",
	tanzania: "Africa/Dar_es_Salaam",
	uganda: "Africa/Kampala",
	cameroon: "Africa/Douala",
	"ivory coast": "Africa/Abidjan",
	senegal: "Africa/Dakar",
	peru: "America/Lima",
	colombia: "America/Bogota",
	venezuela: "America/Caracas",
	chile: "America/Santiago",
	ecuador: "America/Guayaquil",
	bolivia: "America/La_Paz",
	paraguay: "America/Asuncion",
	uruguay: "America/Montevideo",
	cuba: "America/Havana",
	"puerto rico": "America/Puerto_Rico",
	// Common tz aliases
	est: "America/New_York",
	cst: "America/Chicago",
	mst: "America/Denver",
	pst: "America/Los_Angeles",
	gmt: "Etc/GMT",
	utc: "UTC",
	cet: "Europe/Paris",
	eet: "Europe/Helsinki",
	ist: "Asia/Kolkata",
	jst: "Asia/Tokyo",
	cst_china: "Asia/Shanghai",
	aest: "Australia/Sydney",
};

let cityMapCache: Map<string, string> | null = null;

function getCityMap(): Map<string, string> {
	if (cityMapCache !== null) return cityMapCache;

	const map = new Map<string, string>();
	for (const zone of Intl.supportedValuesOf("timeZone")) {
		const parts = zone.split("/");
		const city = parts[parts.length - 1];
		if (city !== undefined) {
			// "New_York" -> "new york"
			const key = city.toLowerCase().replace(/_/g, " ");
			if (!map.has(key)) {
				map.set(key, zone);
			}
		}
	}

	cityMapCache = map;
	return map;
}

export class Region {
	readonly ianaId: string;

	private constructor(ianaId: string) {
		this.ianaId = ianaId;
	}

	static resolve(input: string): Region {
		const trimmed = input.trim();

		// 1. Exact case-insensitive match against IANA zones
		const zones = Intl.supportedValuesOf("timeZone");
		const lowerInput = trimmed.toLowerCase();
		for (const zone of zones) {
			if (zone.toLowerCase() === lowerInput) {
				return new Region(zone);
			}
		}

		// 2. Manual aliases
		const aliasMatch = MANUAL_ALIASES[lowerInput];
		if (aliasMatch !== undefined) {
			return new Region(aliasMatch);
		}

		// 3. City name matching (last segment of IANA path)
		const cityMap = getCityMap();
		const cityMatch = cityMap.get(lowerInput);
		if (cityMatch !== undefined) {
			return new Region(cityMatch);
		}

		throw new InvalidRegionError(trimmed);
	}

	toString(): string {
		return this.ianaId;
	}
}
