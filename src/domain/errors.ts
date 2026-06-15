export class AppError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class InvalidRegionError extends AppError {
	constructor(input: string) {
		super(
			`Could not recognize timezone "${input}". Try a city name like "Tokyo" or an IANA zone like "Asia/Tokyo".`,
		);
	}
}

export class TimeParseError extends AppError {
	constructor(input: string) {
		super(
			`Could not parse time "${input}". Accepted formats: "5pm", "5:30 PM", "17:00", "17:30".`,
		);
	}
}

export class DateParseError extends AppError {
	constructor(input: string) {
		super(
			`Could not parse date "${input}". Accepted formats: "2026-06-14", "14.6.2026", "14/6/2026", "6/14/2026", "June 14 2026".`,
		);
	}
}

export class MissingLocalRegionError extends AppError {
	constructor() {
		super(
			"You provided a `time` or `date` argument, but `region_local` is required to know which timezone those are in.",
		);
	}
}

export class MissingEnvVarError extends AppError {
	constructor(names: string[]) {
		super(`Missing required environment variables: ${names.join(", ")}`);
	}
}
