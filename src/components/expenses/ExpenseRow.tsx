import { formatCurrency } from '../../lib/format';
import type { Category, Expense } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface ExpenseRowProps {
  expense: Expense;
  category: Category | undefined;
  onClick: () => void;
  showDate?: boolean;
}

export function ExpenseRow({ expense, category, onClick, showDate }: ExpenseRowProps) {
  const title = expense.note || category?.name || 'Uncategorized';
  const subtitle = [
    expense.note ? (category?.name ?? 'Uncategorized') : null,
    showDate ? expense.spent_on : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Edit ${title}, ${formatCurrency(expense.amount, expense.currency)}`}
        className="hover:bg-surface-muted flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition"
      >
        <CategoryIcon icon={category?.icon} color={category?.color} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title}</span>
          {subtitle && <span className="text-text-muted block truncate text-xs">{subtitle}</span>}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(expense.amount, expense.currency)}
        </span>
      </button>
    </li>
  );
}
