import { Copy, PiggyBank, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { BudgetBar } from '../components/charts/BudgetBar';
import { CategoryIcon } from '../components/CategoryIcon';
import { MonthPicker } from '../components/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/useToast';
import {
  useBudgets,
  useCategories,
  useDeleteBudget,
  useMonthExpenses,
  useSaveBudget,
} from '../hooks/queries';
import { useMonthParam } from '../hooks/useMonthParam';
import { addMonths } from '../lib/dates';
import { formatCurrency } from '../lib/format';
import { budgetStatus, summarizeMonth } from '../lib/stats';
import { parseAmount } from '../lib/validation';
import type { Budget, Category } from '../types';

interface RowProps {
  category: Category;
  spent: number;
  budget: Budget | undefined;
  month: Date;
}

function BudgetRow({ category, spent, budget, month }: RowProps) {
  const { user } = useAuth();
  const toast = useToast();
  const save = useSaveBudget();
  const remove = useDeleteBudget();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(budget ? budget.amount.toFixed(2) : '');
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValue(budget ? budget.amount.toFixed(2) : '');
    setError(null);
    setEditing(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseAmount(value);
    if ('error' in parsed) return setError(parsed.error);
    if (!user) return;
    save.mutate(
      { userId: user.id, categoryId: category.id, month, amount: parsed.value },
      {
        onSuccess: () => {
          toast(`Budget saved for ${category.name}`);
          setEditing(false);
        },
        onError: (err) => toast(err.message, 'error'),
      },
    );
  }

  function handleRemove() {
    if (!budget) return;
    remove.mutate(budget.id, {
      onSuccess: () => toast(`Budget removed for ${category.name}`),
      onError: (err) => toast(err.message, 'error'),
    });
  }

  const ratio = budget && budget.amount > 0 ? spent / budget.amount : 0;

  return (
    <li className="border-border border-t py-4 first:border-t-0">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{category.name}</p>
          <p className="text-text-muted text-xs tabular-nums">
            {budget
              ? `${formatCurrency(budget.amount)} a month`
              : `${formatCurrency(spent)} spent, no budget`}
          </p>
        </div>
        {!editing && (
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" onClick={startEditing}>
              {budget ? 'Edit' : 'Set budget'}
            </Button>
            {budget && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={remove.isPending}
                aria-label={`Remove budget for ${category.name}`}
                className="text-text-muted hover:bg-surface-muted hover:text-danger grid size-8 place-items-center rounded-lg"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSubmit} noValidate className="mt-3 flex items-start gap-2 sm:pl-13">
          <div className="flex-1">
            <Input
              label={`Monthly budget for ${category.name}`}
              prefix="$"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={error}
            />
          </div>
          <div className="mt-7 flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Save
            </Button>
          </div>
        </form>
      )}

      {budget && !editing && (
        <div className="mt-3 sm:pl-13">
          <BudgetBar spent={spent} budget={budget.amount} ratio={ratio} status={budgetStatus(ratio)} />
        </div>
      )}
    </li>
  );
}

export function BudgetsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [month, setMonth] = useMonthParam();
  const categories = useCategories();
  const expenses = useMonthExpenses(month);
  const budgets = useBudgets(month);
  const lastMonthBudgets = useBudgets(addMonths(month, -1));
  const save = useSaveBudget();
  const [copying, setCopying] = useState(false);

  const summary = summarizeMonth(month, expenses.data ?? [], categories.data ?? [], budgets.data ?? []);
  const spentBy = new Map(summary.byCategory.map((c) => [c.categoryId, c.total]));
  const budgetBy = new Map((budgets.data ?? []).map((b) => [b.category_id, b]));
  const loading = categories.isPending || expenses.isPending || budgets.isPending;
  const error = categories.error ?? expenses.error ?? budgets.error;
  const canCopy = !loading && (budgets.data ?? []).length === 0 && (lastMonthBudgets.data ?? []).length > 0;

  async function copyLastMonth() {
    if (!user) return;
    setCopying(true);
    try {
      await Promise.all(
        (lastMonthBudgets.data ?? []).map((b) =>
          save.mutateAsync({ userId: user.id, categoryId: b.category_id, month, amount: b.amount }),
        ),
      );
      toast("Copied last month's budgets");
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not copy budgets', 'error');
    } finally {
      setCopying(false);
    }
  }

  // Budgeted categories first, then the rest alphabetically.
  const rows = [...(categories.data ?? [])].sort(
    (a, b) => Number(budgetBy.has(b.id)) - Number(budgetBy.has(a.id)) || a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Budgets</h1>
        <p className="text-text-muted mt-1 text-sm">Set a monthly limit for any category.</p>
        <div className="mt-3">
          <MonthPicker month={month} onChange={setMonth} />
        </div>
      </div>

      {error && <ErrorState message={error.message} />}

      <section aria-label="Budget summary" className="grid grid-cols-3 gap-4">
        {[
          ['Budgeted', summary.budgetTotal],
          ['Spent', summary.budgetTotal - summary.budgetLeft],
          ['Left', summary.budgetLeft],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-4">
            <p className="text-text-muted text-xs sm:text-sm">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-6 w-20" />
            ) : (
              <p
                className={`mt-1 truncate text-lg font-bold tabular-nums sm:text-2xl ${
                  label === 'Left' && (value as number) < 0 ? 'text-danger' : ''
                }`}
              >
                {formatCurrency(value as number)}
              </p>
            )}
          </Card>
        ))}
      </section>

      {canCopy && (
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">No budgets for this month yet. Reuse last month's?</p>
          <Button variant="secondary" onClick={copyLastMonth} disabled={copying}>
            <Copy className="size-4" />
            {copying ? 'Copying…' : "Copy last month's budgets"}
          </Button>
        </Card>
      )}

      <Card className="py-2">
        {loading ? (
          <div className="flex flex-col gap-4 py-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No categories"
            message="Add a category first, then set a budget."
          />
        ) : (
          <ul>
            {rows.map((c) => (
              <BudgetRow
                key={`${c.id}-${budgetBy.get(c.id)?.amount ?? 'none'}`}
                category={c}
                spent={spentBy.get(c.id) ?? 0}
                budget={budgetBy.get(c.id)}
                month={month}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
