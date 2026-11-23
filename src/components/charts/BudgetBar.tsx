import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatCurrency } from '../../lib/format';
import type { BudgetStatus } from '../../lib/stats';

const statusStyle: Record<BudgetStatus, { bar: string; text: string; icon: typeof CircleCheck }> = {
  ok: { bar: 'bg-success', text: 'text-success', icon: CircleCheck },
  warning: { bar: 'bg-warning', text: 'text-warning', icon: TriangleAlert },
  over: { bar: 'bg-danger', text: 'text-danger', icon: CircleAlert },
};

interface BudgetBarProps {
  spent: number;
  budget: number;
  ratio: number;
  status: BudgetStatus;
}

/** Progress toward a budget. Status is shown with colour, an icon and words, never colour alone. */
export function BudgetBar({ spent, budget, ratio, status }: BudgetBarProps) {
  const { bar, text, icon: Icon } = statusStyle[status];
  const remaining = budget - spent;
  const label =
    status === 'over' ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} left`;
  return (
    <div>
      <div
        className="bg-surface-muted h-2 rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={Math.min(spent, budget)}
        aria-valuetext={`${formatCurrency(spent)} of ${formatCurrency(budget)} spent, ${label}`}
      >
        <div className={cn('h-2 rounded-full', bar)} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-text-muted tabular-nums">
          {formatCurrency(spent)} of {formatCurrency(budget)}
        </span>
        <span className={cn('flex items-center gap-1 font-semibold', text)}>
          <Icon className="size-3.5" />
          {label}
        </span>
      </div>
    </div>
  );
}
