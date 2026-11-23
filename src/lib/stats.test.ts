import { describe, expect, it } from 'vitest';
import type { Budget, Category, Expense } from '../types';
import { budgetStatus, groupByDay, percentChange, summarizeMonth } from './stats';

const cat = (id: string, name: string): Category => ({
  id,
  name,
  color: 'mint',
  icon: 'tag',
  created_at: '2026-11-01T00:00:00Z',
});

let n = 0;
const exp = (amount: number, spent_on: string, category_id: string | null): Expense => ({
  id: `e${n++}`,
  amount,
  spent_on,
  category_id,
  currency: 'USD',
  note: null,
  created_at: '2026-11-01T00:00:00Z',
});

const november = new Date(2026, 10, 1);
const categories = [cat('food', 'Food'), cat('rent', 'Rent'), cat('fun', 'Fun')];

describe('summarizeMonth', () => {
  const expenses = [
    exp(12.1, '2026-11-02', 'food'),
    exp(0.2, '2026-11-02', 'food'),
    exp(1500, '2026-11-01', 'rent'),
    exp(30, '2026-11-15', null),
    exp(5, '2026-11-15', 'deleted-category'),
  ];
  const budgets: Budget[] = [
    { id: 'b1', category_id: 'food', month: '2026-11-01', amount: 15 },
    { id: 'b2', category_id: 'fun', month: '2026-11-01', amount: 100 },
  ];
  const s = summarizeMonth(november, expenses, categories, budgets);

  it('totals without floating-point drift', () => {
    expect(s.total).toBe(1547.3);
    expect(s.count).toBe(5);
  });

  it('groups by category, largest first, and folds unknown categories into Uncategorized', () => {
    expect(s.byCategory.map((c) => [c.name, c.total])).toEqual([
      ['Rent', 1500],
      ['Uncategorized', 35],
      ['Food', 12.3],
    ]);
    expect(s.topCategory?.name).toBe('Rent');
    expect(s.byCategory.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(1);
  });

  it('returns one point per day of the month', () => {
    expect(s.daily).toHaveLength(30);
    expect(s.daily[0]).toEqual({ date: '2026-11-01', day: 1, total: 1500 });
    expect(s.daily[1].total).toBe(12.3);
    expect(s.daily[14].total).toBe(35);
  });

  it('computes budget progress and status', () => {
    const food = s.budgets.find((b) => b.categoryId === 'food')!;
    expect(food.spent).toBe(12.3);
    expect(food.remaining).toBe(2.7);
    expect(food.status).toBe('warning');
    const fun = s.budgets.find((b) => b.categoryId === 'fun')!;
    expect(fun.status).toBe('ok');
    expect(s.budgetTotal).toBe(115);
    expect(s.budgetLeft).toBe(102.7);
  });

  it('handles an empty month', () => {
    const empty = summarizeMonth(new Date(2026, 1, 1), [], categories);
    expect(empty.total).toBe(0);
    expect(empty.topCategory).toBeNull();
    expect(empty.daily).toHaveLength(28);
  });
});

describe('budgetStatus', () => {
  it.each([
    [0.5, 'ok'],
    [0.8, 'warning'],
    [1, 'warning'],
    [1.01, 'over'],
  ])('%f -> %s', (ratio, status) => {
    expect(budgetStatus(ratio)).toBe(status);
  });
});

describe('percentChange', () => {
  it('returns null without a baseline', () => {
    expect(percentChange(50, 0)).toBeNull();
  });
  it('computes increases and decreases', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
  });
});

describe('groupByDay', () => {
  it('groups newest day first with daily totals', () => {
    const groups = groupByDay([
      exp(1.1, '2026-11-01', null),
      exp(2.2, '2026-11-03', null),
      exp(3.3, '2026-11-03', null),
    ]);
    expect(groups.map((g) => [g.date, g.total, g.items.length])).toEqual([
      ['2026-11-03', 5.5, 2],
      ['2026-11-01', 1.1, 1],
    ]);
  });
});
