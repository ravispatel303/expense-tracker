import {
  PiggyBank,
  Plus,
  Receipt,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { displayNameOf, useAuth } from '../auth/useAuth';
import { BudgetBar } from '../components/charts/BudgetBar';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';
import { SpendingChart } from '../components/charts/SpendingChart';
import { ExpenseRow } from '../components/expenses/ExpenseRow';
import { useExpenseDialog } from '../components/expenses/useExpenseDialog';
import { MonthPicker } from '../components/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/EmptyState';
import { useBudgets, useCategories, useMonthExpenses, usePreviousMonthExpenses } from '../hooks/queries';
import { useMonthParam } from '../hooks/useMonthParam';
import { useNow } from '../hooks/useNow';
import { cn } from '../lib/cn';
import { isSameMonth, monthKey } from '../lib/dates';
import { formatCurrency, greeting } from '../lib/format';
import { percentChange, summarizeMonth } from '../lib/stats';

interface StatProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tint: string;
  detail?: ReactNode;
  loading?: boolean;
}

function Stat({ label, value, icon: Icon, tint, detail, loading }: StatProps) {
  return (
    <Card>
      <div className={cn('text-text mb-4 grid size-10 place-items-center rounded-xl', tint)}>
        <Icon className="size-5" />
      </div>
      <p className="text-text-muted text-sm">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1 truncate text-xl font-bold tracking-tight tabular-nums sm:text-2xl">{value}</p>
      )}
      {detail && !loading && <div className="text-text-muted mt-1 text-xs">{detail}</div>}
    </Card>
  );
}

function Change({ value }: { value: number | null }) {
  if (value === null) return <span>No spending last month</span>;
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3.5" />
      {Math.abs(value).toFixed(0)}% {up ? 'more' : 'less'} than last month
    </span>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const dialog = useExpenseDialog();
  const [month, setMonth] = useMonthParam();
  const now = useNow();

  const categories = useCategories();
  const expenses = useMonthExpenses(month);
  const previous = usePreviousMonthExpenses(month);
  const budgets = useBudgets(month);

  const loading = categories.isPending || expenses.isPending;
  const error = categories.error ?? expenses.error ?? budgets.error;
  const summary = summarizeMonth(month, expenses.data ?? [], categories.data ?? [], budgets.data ?? []);
  const prevTotal = (previous.data ?? []).reduce((s, e) => s + e.amount, 0);
  const catById = new Map((categories.data ?? []).map((c) => [c.id, c]));
  const name = displayNameOf(user);
  const current = isSameMonth(month, now);
  const monthQuery = current ? '' : `?month=${monthKey(month)}`;
  const hasBudgets = summary.budgets.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting(now)}
            {name ? `, ${name}` : ''} 👋
          </h1>
          <div className="mt-3">
            <MonthPicker month={month} onChange={setMonth} />
          </div>
        </div>
      </div>

      {error && <ErrorState message={error.message} />}

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label={current ? 'Spent this month' : 'Spent'}
          value={formatCurrency(summary.total)}
          icon={Wallet}
          tint="bg-lavender"
          loading={loading}
          detail={previous.isSuccess && <Change value={percentChange(summary.total, prevTotal)} />}
        />
        <Stat
          label="Budget left"
          value={hasBudgets ? formatCurrency(summary.budgetLeft) : '—'}
          icon={PiggyBank}
          tint="bg-mint"
          loading={loading || budgets.isPending}
          detail={
            hasBudgets ? (
              `of ${formatCurrency(summary.budgetTotal)} budgeted`
            ) : (
              <Link to={`/budgets${monthQuery}`} className="text-primary font-semibold hover:underline">
                Set a budget
              </Link>
            )
          }
        />
        <Stat
          label="Transactions"
          value={summary.count}
          icon={Receipt}
          tint="bg-peach"
          loading={loading}
          detail={summary.count > 0 ? `Avg ${formatCurrency(summary.total / summary.count)} each` : undefined}
        />
        <Stat
          label="Top category"
          value={summary.topCategory?.name ?? '—'}
          icon={Tag}
          tint="bg-sky"
          loading={loading}
          detail={
            summary.topCategory
              ? `${formatCurrency(summary.topCategory.total)} · ${Math.round(summary.topCategory.share * 100)}%`
              : undefined
          }
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Spending per day</h2>
          <div className="mt-4">
            {loading ? <Skeleton className="h-56 w-full" /> : <SpendingChart data={summary.daily} />}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">By category</h2>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : summary.byCategory.length ? (
              <CategoryBreakdown rows={summary.byCategory} />
            ) : (
              <p className="text-text-muted grid h-56 place-items-center text-center text-sm">
                Add expenses to see where your money goes.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent expenses</h2>
            {summary.count > 0 && (
              <Link
                to={`/expenses${monthQuery}`}
                className="text-primary text-sm font-semibold hover:underline"
              >
                See all
              </Link>
            )}
          </div>
          {loading ? (
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : summary.count ? (
            <ul className="-mx-2 mt-2">
              {(expenses.data ?? []).slice(0, 6).map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  category={e.category_id ? catById.get(e.category_id) : undefined}
                  onClick={() => dialog.open(e)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              message="Add your first expense and your dashboard fills in with totals, trends and budgets."
              action={
                <Button onClick={() => dialog.open()}>
                  <Plus className="size-4" />
                  Add expense
                </Button>
              }
            />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Budgets</h2>
            <Link to={`/budgets${monthQuery}`} className="text-primary text-sm font-semibold hover:underline">
              {hasBudgets ? 'Manage' : 'Set up'}
            </Link>
          </div>
          {hasBudgets ? (
            <ul className="mt-4 flex flex-col gap-4">
              {summary.budgets.slice(0, 4).map((b) => (
                <li key={b.budgetId}>
                  <p className="mb-1.5 text-sm font-medium">{b.name}</p>
                  <BudgetBar spent={b.spent} budget={b.budget} ratio={b.ratio} status={b.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted mt-4 text-sm">
              Set a monthly limit for a category to see how much is left.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
