import { describe, expect, it } from 'vitest';
import { formatCurrency, formatMonth, greeting } from './format';

describe('formatCurrency', () => {
  it('formats USD with two decimals and separators', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('supports other currencies', () => {
    expect(formatCurrency(10, 'EUR', 'en-US')).toBe('€10.00');
  });
});

describe('greeting', () => {
  it.each([
    [8, 'Good morning'],
    [14, 'Good afternoon'],
    [20, 'Good evening'],
  ])('at %i:00 says "%s"', (hour, expected) => {
    expect(greeting(new Date(2026, 0, 1, hour))).toBe(expected);
  });
});

describe('formatMonth', () => {
  it('shows the full month and year', () => {
    expect(formatMonth(new Date(2026, 10, 22))).toBe('November 2026');
  });
});
