import type { Budget, Category, CategoryColor, Expense } from '../types';
import { daysInMonth, parseISODate, toISODate } from './dates';

export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface CategoryTotal {
  categoryId: string | null;
  name: string;
  color: CategoryColor | null;
  icon: string;
  total: number;
  count: number;
  /** Share of the month's total, 0–1. */
  share: number;
}

export interface DailyTotal {
  date: string;
  day: number;
  total: number;
}

export interface BudgetProgress {
  budgetId: string;
  categoryId: string;
  name: string;
  color: CategoryColor;
  icon: string;
  budget: number;
  spent: number;
  remaining: number;
  /** spent / budget (can exceed 1). */
  ratio: number;
  status: BudgetStatus;
}

export interface MonthSummary {
  total: number;
  count: number;
  byCategory: CategoryTotal[];
  daily: DailyTotal[];
  topCategory: CategoryTotal | null;
  budgets: BudgetProgress[];
  budgetTotal: number;
  /** Total budget minus spending in budgeted categories. */
  budgetLeft: number;
}

/** Spending at or above this share of a budget is a warning. */
export const BUDGET_WARNING_RATIO = 0.8;

/** Round to cents to avoid floating-point drift when summing money. */
export const roundMoney = (n: number) => Math.round(n * 100) / 100;

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) return 'over';
  if (ratio >= BUDGET_WARNING_RATIO) return 'warning';
  return 'ok';
}

export function summarizeMonth(
  month: Date,
  expenses: Expense[],
  categories: Category[],
  budgets: Budget[] = [],
): MonthSummary {
  const catById = new Map(categories.map((c) => [c.id, c]));

  let totalCents = 0;
  const perCategory = new Map<string | null, { cents: number; count: number }>();
  const perDay = new Map<string, number>();

  for (const e of expenses) {
    const cents = Math.round(e.amount * 100);
    totalCents += cents;
    // Expenses whose category was deleted count as uncategorized.
    const key = e.category_id && catById.has(e.category_id) ? e.category_id : null;
    const entry = perCategory.get(key) ?? { cents: 0, count: 0 };
    entry.cents += cents;
    entry.count += 1;
    perCategory.set(key, entry);
    perDay.set(e.spent_on, (perDay.get(e.spent_on) ?? 0) + cents);
  }

  const total = totalCents / 100;

  const byCategory: CategoryTotal[] = [...perCategory.entries()]
    .map(([id, { cents, count }]) => {
      const cat = id ? catById.get(id) : undefined;
      return {
        categoryId: id,
        name: cat?.name ?? 'Uncategorized',
        color: cat?.color ?? null,
        icon: cat?.icon ?? 'tag',
        total: cents / 100,
        count,
        share: totalCents ? cents / totalCents : 0,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  const daily: DailyTotal[] = [];
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  for (let d = 1; d <= daysInMonth(first); d++) {
    const iso = toISODate(new Date(first.getFullYear(), first.getMonth(), d));
    daily.push({ date: iso, day: d, total: (perDay.get(iso) ?? 0) / 100 });
  }

  const budgetRows: BudgetProgress[] = budgets
    .filter((b) => catById.has(b.category_id))
    .map((b) => {
      const cat = catById.get(b.category_id)!;
      const spent = (perCategory.get(b.category_id)?.cents ?? 0) / 100;
      const ratio = b.amount > 0 ? spent / b.amount : 0;
      return {
        budgetId: b.id,
        categoryId: b.category_id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        budget: b.amount,
        spent,
        remaining: roundMoney(b.amount - spent),
        ratio,
        status: budgetStatus(ratio),
      };
    })
    .sort((a, b) => b.ratio - a.ratio);

  const budgetTotal = roundMoney(budgetRows.reduce((s, b) => s + b.budget, 0));
  const budgetedSpent = roundMoney(budgetRows.reduce((s, b) => s + b.spent, 0));

  return {
    total,
    count: expenses.length,
    byCategory,
    daily,
    topCategory: byCategory[0] ?? null,
    budgets: budgetRows,
    budgetTotal,
    budgetLeft: roundMoney(budgetTotal - budgetedSpent),
  };
}

/** Percentage change from previous to current; null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Group expenses by date (newest first), keeping the input order inside each day. */
export function groupByDay(expenses: Expense[]): { date: string; total: number; items: Expense[] }[] {
  const groups = new Map<string, Expense[]>();
  for (const e of expenses) {
    const list = groups.get(e.spent_on) ?? [];
    list.push(e);
    groups.set(e.spent_on, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => parseISODate(b).getTime() - parseISODate(a).getTime())
    .map(([date, items]) => ({
      date,
      items,
      total: roundMoney(items.reduce((s, e) => s + e.amount, 0)),
    }));
}

const MAX_CATEGORY_ROWS = 6;

/** Top categories folded into "Other" beyond six rows. */
export function foldCategories(rows: CategoryTotal[], max = MAX_CATEGORY_ROWS): CategoryTotal[] {
  if (rows.length <= max) return rows;
  const head = rows.slice(0, max - 1);
  const tail = rows.slice(max - 1);
  return [
    ...head,
    {
      categoryId: '__other',
      name: `Other (${tail.length})`,
      color: null,
      icon: 'tag',
      total: tail.reduce((s, r) => s + r.total, 0),
      count: tail.reduce((s, r) => s + r.count, 0),
      share: tail.reduce((s, r) => s + r.share, 0),
    },
  ];
}
