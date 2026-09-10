/** Trip dates are calendar days, so every format call pins to UTC to avoid
 *  a timezone shifting "12 Sep" into "11 Sep" for someone. */

const MS_PER_DAY = 86_400_000;

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return isoDay(new Date());
}

export function formatDay(date: Date, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(date);
}

export function formatRange(start: Date, end: Date): string {
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  const startPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: sameMonth ? undefined : "short",
  }).format(start);
  const endPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);
  return `${startPart} – ${endPart}`;
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((b - a) / MS_PER_DAY);
}

export function tripStatus(start: Date, end: Date, now = new Date()) {
  const untilStart = daysBetween(now, start);
  const totalDays = daysBetween(start, end) + 1;

  if (untilStart > 0) {
    return { label: untilStart === 1 ? "Leaves tomorrow" : `${untilStart} days to go`, tone: "sun" as const };
  }
  const sinceStart = daysBetween(start, now);
  if (sinceStart < totalDays) {
    return { label: `Day ${sinceStart + 1} of ${totalDays}`, tone: "sage" as const };
  }
  return { label: "Trip wrapped", tone: "sea" as const };
}

/** Every calendar day of the trip, as ISO strings. */
export function tripDays(start: Date, end: Date): string[] {
  const days: string[] = [];
  const total = daysBetween(start, end);
  for (let i = 0; i <= total; i += 1) {
    days.push(new Date(start.getTime() + i * MS_PER_DAY).toISOString().slice(0, 10));
  }
  return days;
}

export function timeAgo(date: Date, now = new Date()): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2629800],
    ["year", 31557600],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let chosen: [Intl.RelativeTimeFormatUnit, number] = units[0];
  for (const unit of units) {
    if (seconds >= unit[1]) chosen = unit;
  }
  return formatter.format(-Math.round(seconds / chosen[1]), chosen[0]);
}
