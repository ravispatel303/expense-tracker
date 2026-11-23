import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../config/app';

/** Format a number as currency, e.g. 1234.5 -> "$1,234.50". */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Return a time-of-day greeting for the given date. */
export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Format a date as "November 2026". */
export function formatMonth(date: Date = new Date(), locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}
