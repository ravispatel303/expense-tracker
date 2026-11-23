/**
 * Date helpers that work in the user's local calendar.
 * Expense dates are stored as plain "YYYY-MM-DD" strings, so we never
 * round-trip them through UTC (which would shift dates near midnight).
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date -> "YYYY-MM-DD". */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> local Date at midnight. */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "YYYY-MM" key for a date's month. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Parse "YYYY-MM"; returns null if invalid. */
export function parseMonthKey(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [y, m] = value.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** First and last day of a month as "YYYY-MM-DD". */
export function monthRange(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** "Today", "Yesterday", or e.g. "Fri, Nov 20". */
export function formatDayHeading(iso: string, today: Date = new Date()): string {
  const todayIso = toISODate(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (iso === todayIso) return 'Today';
  if (iso === toISODate(yesterday)) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(
    parseISODate(iso),
  );
}

/** First day of the current month (local time). */
export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
