/**
 * All statement/due/effective dates are plain YYYY-MM-DD strings (no
 * time component) so day-difference math can't be thrown off by
 * timezones or hours. Everything here parses/formats against that
 * convention.
 */

export function todayISO(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** a - b, in whole days. Positive when `a` is after `b`. */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const da = parseISODate(a).getTime();
  const db = parseISODate(b).getTime();
  return Math.round((da - db) / msPerDay);
}

export function isAfter(a: string, b: string): boolean {
  return daysBetween(a, b) > 0;
}

export function isOnOrBefore(a: string, b: string): boolean {
  return daysBetween(a, b) <= 0;
}

export function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
