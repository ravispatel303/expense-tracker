import { Plus, Receipt, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ExpenseRow } from '../components/expenses/ExpenseRow';
import { useExpenseDialog } from '../components/expenses/useExpenseDialog';
import { MonthPicker } from '../components/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/EmptyState';
import { fieldClass } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useCategories, useMonthExpenses } from '../hooks/queries';
import { useMonthParam } from '../hooks/useMonthParam';
import { formatDayHeading } from '../lib/dates';
import { formatCurrency } from '../lib/format';
import { groupByDay, roundMoney } from '../lib/stats';

const UNCATEGORIZED = '__none';

export function ExpensesPage() {
  const dialog = useExpenseDialog();
  const [month, setMonth] = useMonthParam();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = useCategories();
  const expenses = useMonthExpenses(month);
  const catById = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c])), [categories.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (expenses.data ?? []).filter((e) => {
      const cat = e.category_id ? catById.get(e.category_id) : undefined;
      if (categoryFilter === UNCATEGORIZED && cat) return false;
      if (categoryFilter && categoryFilter !== UNCATEGORIZED && e.category_id !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        (e.note ?? '').toLowerCase().includes(q) ||
        (cat?.name ?? 'uncategorized').toLowerCase().includes(q) ||
        e.amount.toFixed(2).includes(q)
      );
    });
  }, [expenses.data, catById, query, categoryFilter]);

  const groups = groupByDay(filtered);
  const total = roundMoney(filtered.reduce((s, e) => s + e.amount, 0));
  const isFiltering = Boolean(query.trim() || categoryFilter);
  const loading = expenses.isPending || categories.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Expenses</h1>
          <div className="mt-3">
            <MonthPicker month={month} onChange={setMonth} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="expense-search" className="sr-only">
            Search expenses
          </label>
          <Search className="text-text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            id="expense-search"
            type="search"
            placeholder="Search notes, categories or amounts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
        <div className="sm:w-56">
          <Select
            label="Filter by category"
            hideLabel
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={UNCATEGORIZED}>Uncategorized</option>
          </Select>
        </div>
      </div>

      {expenses.error && <ErrorState message={expenses.error.message} />}

      <Card className="p-3 sm:p-4">
        {loading ? (
          <div className="flex flex-col gap-3 p-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          isFiltering ? (
            <EmptyState icon={Search} title="No matches" message="Try a different search or category." />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No expenses this month"
              message="Expenses you add will show up here, grouped by day."
              action={
                <Button onClick={() => dialog.open()}>
                  <Plus className="size-4" />
                  Add expense
                </Button>
              }
            />
          )
        ) : (
          <>
            <div className="flex items-baseline justify-between px-2 pt-1 pb-3">
              <p className="text-text-muted text-sm">
                {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
                {isFiltering && ' matching'}
              </p>
              <p className="text-sm">
                Total <span className="font-bold tabular-nums">{formatCurrency(total)}</span>
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {groups.map((g) => (
                <section key={g.date} aria-label={formatDayHeading(g.date)}>
                  <div className="border-border flex items-baseline justify-between border-t px-2 pt-3 pb-1">
                    <h2 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
                      {formatDayHeading(g.date)}
                    </h2>
                    <span className="text-text-muted text-xs font-medium tabular-nums">
                      {formatCurrency(g.total)}
                    </span>
                  </div>
                  <ul>
                    {g.items.map((e) => (
                      <ExpenseRow
                        key={e.id}
                        expense={e}
                        category={e.category_id ? catById.get(e.category_id) : undefined}
                        onClick={() => dialog.open(e)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
