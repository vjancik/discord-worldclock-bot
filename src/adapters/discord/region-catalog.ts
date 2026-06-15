// Builds the autocomplete candidate list, cached at module level.

let catalogCache: string[] | null = null;

// Friendly display names that map to standard IANA zones (for autocomplete display)
const FRIENDLY_ENTRIES: string[] = [
	"UTC",
	"GMT",
	// Americas
	"New York",
	"Los Angeles",
	"Chicago",
	"Denver",
	"Toronto",
	"Vancouver",
	"Mexico City",
	"Sao Paulo",
	"Buenos Aires",
	"Lima",
	"Bogota",
	"Santiago",
	"Caracas",
	"Havana",
	// Europe
	"London",
	"Paris",
	"Berlin",
	"Madrid",
	"Rome",
	"Amsterdam",
	"Brussels",
	"Vienna",
	"Zurich",
	"Prague",
	"Warsaw",
	"Budapest",
	"Bucharest",
	"Athens",
	"Helsinki",
	"Stockholm",
	"Oslo",
	"Copenhagen",
	"Lisbon",
	"Dublin",
	"Kyiv",
	"Moscow",
	"Istanbul",
	"Belgrade",
	"Bratislava",
	"Zagreb",
	"Sofia",
	"Tallinn",
	"Riga",
	"Vilnius",
	// Asia
	"Tokyo",
	"Shanghai",
	"Beijing",
	"Hong Kong",
	"Singapore",
	"Seoul",
	"Taipei",
	"Bangkok",
	"Jakarta",
	"Kuala Lumpur",
	"Manila",
	"Kolkata",
	"Mumbai",
	"Delhi",
	"Karachi",
	"Dhaka",
	"Colombo",
	"Kathmandu",
	"Almaty",
	"Tashkent",
	"Tehran",
	"Baghdad",
	"Riyadh",
	"Dubai",
	"Kuwait",
	"Amman",
	"Beirut",
	"Jerusalem",
	"Tbilisi",
	"Baku",
	"Yerevan",
	"Ho Chi Minh",
	"Hanoi",
	"Phnom Penh",
	"Vientiane",
	"Yangon",
	"Ulaanbaatar",
	"Kabul",
	"Muscat",
	// Africa
	"Cairo",
	"Lagos",
	"Nairobi",
	"Johannesburg",
	"Casablanca",
	"Addis Ababa",
	"Dar Es Salaam",
	"Kampala",
	"Douala",
	"Abidjan",
	"Accra",
	"Dakar",
	// Pacific / Oceania
	"Sydney",
	"Melbourne",
	"Brisbane",
	"Perth",
	"Auckland",
	"Fiji",
	"Honolulu",
	"Anchorage",
	// Country / region names
	"Japan",
	"Germany",
	"France",
	"UK",
	"USA",
	"Australia",
	"India",
	"China",
	"Brazil",
	"Russia",
	"Canada",
	"South Korea",
	"New Zealand",
	"Israel",
	"Turkey",
	"Ukraine",
	"Poland",
	"Netherlands",
	"Ireland",
	"Czechia",
	"Vietnam",
	"Thailand",
	"Indonesia",
	"Malaysia",
	"Philippines",
	"Pakistan",
	"Bangladesh",
	"Egypt",
	"South Africa",
	"Nigeria",
	"Kenya",
	"Saudi Arabia",
	"UAE",
	"Argentina",
	"Mexico",
	"Colombia",
	"Peru",
	"Chile",
	"Singapore",
	"Norway",
	"Sweden",
	"Denmark",
	"Finland",
	"Austria",
	"Switzerland",
	"Belgium",
	"Portugal",
	"Spain",
	"Italy",
	"Romania",
	"Hungary",
	"Slovakia",
	"Croatia",
	"Serbia",
	"Bulgaria",
	"Estonia",
	"Latvia",
	"Lithuania",
	"Kazakhstan",
	"Iran",
	"Iraq",
	"Morocco",
	"Ethiopia",
	"Ghana",
	"Mongolia",
	"Taiwan",
	"Hong Kong",
	"Myanmar",
	"Cambodia",
	"Laos",
	"Nepal",
	"Sri Lanka",
	"Afghanistan",
	"Uzbekistan",
	"Jordan",
	"Kuwait",
	"Qatar",
	"Bahrain",
	"Oman",
	"Cuba",
	"Venezuela",
	"Bolivia",
	"Ecuador",
	"Paraguay",
	"Uruguay",
	"Puerto Rico",
];

// Deduplicate + capitalize first letter of each word
function capitalize(s: string): string {
	return s
		.split(" ")
		.map((w) => (w.length > 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
		.join(" ");
}

export function getRegionCatalog(): string[] {
	if (catalogCache !== null) return catalogCache;

	const seen = new Set<string>();
	const result: string[] = [];

	const add = (entry: string) => {
		const cap = capitalize(entry.trim());
		if (!seen.has(cap.toLowerCase())) {
			seen.add(cap.toLowerCase());
			result.push(cap);
		}
	};

	// Friendly names first (better UX — most common)
	for (const entry of FRIENDLY_ENTRIES) {
		add(entry);
	}

	// Then all IANA zone ids (covers edge cases and expert users)
	for (const zone of Intl.supportedValuesOf("timeZone")) {
		add(zone);
	}

	catalogCache = result;
	return result;
}

export function searchRegionCatalog(query: string): string[] {
	const lower = query.toLowerCase();
	const catalog = getRegionCatalog();
	return catalog
		.filter((entry) => entry.toLowerCase().startsWith(lower))
		.slice(0, 25);
}
