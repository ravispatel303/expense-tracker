import { describe, expect, it } from 'vitest';
import { parseAmount, validateCategoryName } from './validation';

describe('parseAmount', () => {
  it.each([
    ['12', 12],
    ['12.5', 12.5],
    ['$1,234.56', 1234.56],
    [' 0.99 ', 0.99],
  ])('accepts %s', (raw, value) => {
    expect(parseAmount(raw)).toEqual({ value });
  });

  it.each(['', 'abc', '1.234', '-5', '0', '0.00', '1e5', '99999999999'])('rejects %s', (raw) => {
    expect(parseAmount(raw)).toHaveProperty('error');
  });
});

describe('validateCategoryName', () => {
  it('requires a unique, non-empty name', () => {
    expect(validateCategoryName('  ', [])).toMatch(/enter a name/i);
    expect(validateCategoryName('food', ['Food'])).toMatch(/already/i);
    expect(validateCategoryName('x'.repeat(41), [])).toMatch(/under 40/i);
    expect(validateCategoryName('Pets', ['Food'])).toBeNull();
  });
});
