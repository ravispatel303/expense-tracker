import { createContext, useContext } from 'react';
import type { Expense } from '../../types';

export interface ExpenseDialogApi {
  /** Open the dialog to add a new expense, or to edit an existing one. */
  open: (expense?: Expense) => void;
}

export const ExpenseDialogContext = createContext<ExpenseDialogApi | null>(null);

export function useExpenseDialog(): ExpenseDialogApi {
  const ctx = useContext(ExpenseDialogContext);
  if (!ctx) throw new Error('useExpenseDialog must be used inside <ExpenseDialogProvider>');
  return ctx;
}
