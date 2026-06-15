import { DateTime } from "luxon";
import type {
	ConversionResult,
	CurrentTimeResult,
	RegionInfo,
} from "../../application/use-cases/resolve-world-clock.ts";

function discordTimestamp(utcMillis: number): string {
	const seconds = Math.floor(utcMillis / 1000);
	return `<t:${seconds}:F>`;
}

function formatLocalDateTime(utcMillis: number, ianaId: string): string {
	return DateTime.fromMillis(utcMillis, { zone: ianaId }).toFormat(
		"EEEE, MMMM d, yyyy 'at' h:mm a",
	);
}

function regionLine(info: RegionInfo, utcMillis: number): string {
	return `🕐 **${info.city}** (${info.ianaId}) — ${info.label}\n${formatLocalDateTime(utcMillis, info.ianaId)}`;
}

export function formatCurrentTime(result: CurrentTimeResult): string {
	const { target, utcMillis } = result;
	return [
		regionLine(target, utcMillis),
		``,
		`-# Converted on: ${discordTimestamp(utcMillis)}`,
	].join("\n");
}

export function formatConversion(result: ConversionResult): string {
	const { source, sourceUtcMillis, target, targetUtcMillis } = result;
	return [
		`🔄 **Time Conversion**`,
		``,
		`From Region: **${source.city}** (${source.ianaId}) — ${source.label}`,
		`At Time: ${formatLocalDateTime(sourceUtcMillis, source.ianaId)}`,
		``,
		`To Region: **${target.city}** (${target.ianaId}) — ${target.label}`,
		`Destination Time: **${formatLocalDateTime(targetUtcMillis, target.ianaId)}**`,
	].join("\n");
}
