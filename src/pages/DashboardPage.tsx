import { CalendarDays, PiggyBank, Plus, Receipt, Tag, Wallet } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatCurrency, formatMonth, greeting } from '../lib/format';

const stats = [
  { label: 'Spent this month', value: formatCurrency(0), icon: Wallet, tint: 'bg-lavender' },
  { label: 'Budget left', value: formatCurrency(0), icon: PiggyBank, tint: 'bg-mint' },
  { label: 'Transactions', value: '0', icon: Receipt, tint: 'bg-peach' },
  { label: 'Top category', value: '—', icon: Tag, tint: 'bg-sky' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-text-muted flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-4" />
            {formatMonth()}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting()}
            {name ? `, ${name}` : ''} 👋
          </h1>
        </div>
        <Button disabled title="Coming in Phase 1">
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <Card key={label}>
            <div className={`mb-4 grid size-10 place-items-center rounded-xl ${tint} text-text`}>
              <Icon className="size-5" />
            </div>
            <p className="text-text-muted text-sm">{label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Spending over time</h2>
          <div className="border-border bg-surface-muted/50 text-text-muted mt-4 grid h-56 place-items-center rounded-xl border border-dashed text-sm">
            Your spending trend will appear here.
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">By category</h2>
          <div className="border-border bg-surface-muted/50 text-text-muted mt-4 grid h-56 place-items-center rounded-xl border border-dashed text-sm">
            Category breakdown will appear here.
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-center py-10 text-center">
        <div className="bg-rose grid size-14 place-items-center rounded-2xl">
          <Receipt className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No expenses yet</h2>
        <p className="text-text-muted mt-1 max-w-sm text-sm">
          Once you add your first expense, your dashboard will fill in with totals, trends and budgets.
        </p>
      </Card>
    </div>
  );
}
