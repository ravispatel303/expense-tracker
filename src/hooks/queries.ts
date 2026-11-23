import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { addMonths, monthRange, toISODate } from '../lib/dates';
import type { CategoryInput, ExpenseInput } from '../types';

export const keys = {
  categories: ['categories'] as const,
  expenses: (start: string, end: string) => ['expenses', start, end] as const,
  budgets: (month: string) => ['budgets', month] as const,
};

const firstOfMonth = (month: Date) => toISODate(new Date(month.getFullYear(), month.getMonth(), 1));

// ---------- Queries ----------

export function useCategories() {
  return useQuery({ queryKey: keys.categories, queryFn: api.listCategories });
}

export function useMonthExpenses(month: Date) {
  const range = monthRange(month);
  return useQuery({
    queryKey: keys.expenses(range.start, range.end),
    queryFn: () => api.listExpenses(range),
  });
}

export function usePreviousMonthExpenses(month: Date) {
  return useMonthExpenses(addMonths(month, -1));
}

export function useBudgets(month: Date) {
  const key = firstOfMonth(month);
  return useQuery({ queryKey: keys.budgets(key), queryFn: () => api.listBudgets(key) });
}

// ---------- Mutations ----------

function useInvalidate() {
  const qc = useQueryClient();
  return (...prefixes: string[]) => Promise.all(prefixes.map((p) => qc.invalidateQueries({ queryKey: [p] })));
}

export function useSaveExpense() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ExpenseInput }) =>
      id ? api.updateExpense(id, input) : api.createExpense(input),
    onSuccess: () => invalidate('expenses'),
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => invalidate('expenses'),
  });
}

export function useSaveCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CategoryInput }) =>
      id ? api.updateCategory(id, input) : api.createCategory(input),
    onSuccess: () => invalidate('categories'),
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.deleteCategory,
    // Deleting a category uncategorizes expenses and removes its budgets.
    onSuccess: () => invalidate('categories', 'expenses', 'budgets'),
  });
}

export function useSaveBudget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { userId: string; categoryId: string; month: Date; amount: number }) =>
      api.upsertBudget({
        userId: input.userId,
        category_id: input.categoryId,
        month: firstOfMonth(input.month),
        amount: input.amount,
      }),
    onSuccess: () => invalidate('budgets'),
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.deleteBudget,
    onSuccess: () => invalidate('budgets'),
  });
}
