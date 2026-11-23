import { describe, expect, it } from 'vitest';
import {
  addMonths,
  daysInMonth,
  formatDayHeading,
  monthKey,
  monthRange,
  parseISODate,
  parseMonthKey,
  toISODate,
} from './dates';

describe('dates', () => {
  it('round-trips local dates without timezone shifts', () => {
    const d = new Date(2026, 0, 31, 23, 59);
    expect(toISODate(d)).toBe('2026-01-31');
    expect(toISODate(parseISODate('2026-01-31'))).toBe('2026-01-31');
  });

  it('computes month ranges, including leap years', () => {
    expect(monthRange(new Date(2028, 1, 10))).toEqual({ start: '2028-02-01', end: '2028-02-29' });
    expect(daysInMonth(new Date(2026, 1, 1))).toBe(28);
  });

  it('moves across year boundaries', () => {
    expect(monthKey(addMonths(new Date(2026, 11, 15), 1))).toBe('2027-01');
    expect(monthKey(addMonths(new Date(2026, 0, 31), -1))).toBe('2025-12');
  });

  it('parses month keys and rejects bad input', () => {
    expect(parseMonthKey('2026-11')).toEqual(new Date(2026, 10, 1));
    expect(parseMonthKey('2026-13')).toBeNull();
    expect(parseMonthKey('nope')).toBeNull();
    expect(parseMonthKey(null)).toBeNull();
  });

  it('labels today and yesterday', () => {
    const today = new Date(2026, 10, 22);
    expect(formatDayHeading('2026-11-22', today)).toBe('Today');
    expect(formatDayHeading('2026-11-21', today)).toBe('Yesterday');
    expect(formatDayHeading('2026-11-20', today)).toBe('Fri, Nov 20');
  });
});
