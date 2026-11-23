import type { Budget, Category, CategoryInput, Expense, ExpenseInput } from '../types';
import { supabase } from './supabase';

/**
 * Thin, typed wrapper around Supabase. Row-Level Security on the database
 * guarantees each query only ever sees the signed-in user's rows.
 */

function db() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// Postgres numeric columns can arrive as strings; normalise to numbers.
const toExpense = (row: Expense): Expense => ({ ...row, amount: Number(row.amount) });
const toBudget = (row: Budget): Budget => ({ ...row, amount: Number(row.amount) });

const EXPENSE_COLUMNS = 'id, category_id, amount, currency, spent_on, note, created_at';

// ---------- Categories ----------

export async function listCategories(): Promise<Category[]> {
  return check(await db().from('categories').select('id, name, color, icon, created_at').order('name'));
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return check(await db().from('categories').insert(input).select().single());
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return check(await db().from('categories').update(input).eq('id', id).select().single());
}

export async function deleteCategory(id: string): Promise<void> {
  check(await db().from('categories').delete().eq('id', id));
}

// ---------- Expenses ----------

export async function listExpenses(range: { start: string; end: string }): Promise<Expense[]> {
  const rows: Expense[] = check(
    await db()
      .from('expenses')
      .select(EXPENSE_COLUMNS)
      .gte('spent_on', range.start)
      .lte('spent_on', range.end)
      .order('spent_on', { ascending: false })
      .order('created_at', { ascending: false }),
  );
  return rows.map(toExpense);
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  return toExpense(check(await db().from('expenses').insert(input).select(EXPENSE_COLUMNS).single()));
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
  return toExpense(
    check(await db().from('expenses').update(input).eq('id', id).select(EXPENSE_COLUMNS).single()),
  );
}

export async function deleteExpense(id: string): Promise<void> {
  check(await db().from('expenses').delete().eq('id', id));
}

// ---------- Budgets ----------

export async function listBudgets(month: string): Promise<Budget[]> {
  const rows: Budget[] = check(
    await db().from('budgets').select('id, category_id, month, amount').eq('month', month),
  );
  return rows.map(toBudget);
}

/** Create or update the budget for one category in one month. */
export async function upsertBudget(input: {
  userId: string;
  category_id: string;
  month: string;
  amount: number;
}): Promise<Budget> {
  const { userId, ...rest } = input;
  return toBudget(
    check(
      await db()
        .from('budgets')
        .upsert({ ...rest, user_id: userId }, { onConflict: 'user_id,category_id,month' })
        .select('id, category_id, month, amount')
        .single(),
    ),
  );
}

export async function deleteBudget(id: string): Promise<void> {
  check(await db().from('budgets').delete().eq('id', id));
}
