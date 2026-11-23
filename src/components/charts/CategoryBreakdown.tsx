import { formatCurrency } from '../../lib/format';
import { foldCategories, type CategoryTotal } from '../../lib/stats';
import { CategoryIcon } from '../CategoryIcon';

/** Ranked horizontal bars. Bars share one colour; the pastel icon carries category identity. */
export function CategoryBreakdown({ rows }: { rows: CategoryTotal[] }) {
  const folded = foldCategories(rows);
  const max = Math.max(...folded.map((r) => r.total), 0);
  return (
    <ul className="flex flex-col gap-3.5">
      {folded.map((r) => (
        <li key={r.categoryId ?? 'none'} className="flex items-center gap-3">
          <CategoryIcon icon={r.icon} color={r.color} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{r.name}</span>
              <span className="shrink-0 font-semibold tabular-nums">
                {formatCurrency(r.total)}
                <span className="text-text-muted ml-1.5 text-xs font-normal">
                  {Math.round(r.share * 100)}%
                </span>
              </span>
            </div>
            <div className="bg-surface-muted mt-1.5 h-2 rounded-full">
              <div
                className="bg-chart-bar h-2 rounded-full"
                style={{ width: `${max ? Math.max((r.total / max) * 100, 2) : 0}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
