export const CATEGORY_COLORS = ['lavender', 'mint', 'peach', 'sky', 'rose', 'butter'] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
  icon: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  /** Local calendar date, "YYYY-MM-DD". */
  spent_on: string;
  note: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  /** First day of the month, "YYYY-MM-01". */
  month: string;
  amount: number;
}

export interface ExpenseInput {
  amount: number;
  category_id: string | null;
  spent_on: string;
  note: string | null;
}

export interface CategoryInput {
  name: string;
  color: CategoryColor;
  icon: string;
}
