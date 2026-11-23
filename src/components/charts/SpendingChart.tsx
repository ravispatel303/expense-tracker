import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../lib/format';
import { parseISODate } from '../../lib/dates';
import type { DailyTotal } from '../../lib/stats';

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

interface TooltipProps {
  active?: boolean;
  payload?: { payload: DailyTotal }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const label = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(
    parseISODate(point.date),
  );
  return (
    <div className="border-border bg-surface rounded-xl border px-3 py-2 text-sm shadow-lg">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="font-semibold tabular-nums">{formatCurrency(point.total)}</p>
    </div>
  );
}

/** Daily spending for one month: a single series, so the card title names it and no legend is needed. */
export function SpendingChart({ data }: { data: DailyTotal[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <figure className="m-0">
      <div className="h-56" role="img" aria-label={`Daily spending chart, ${formatCurrency(total)} in total`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={12}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              allowDecimals={false}
              tickFormatter={(v: number) => compactCurrency.format(v)}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'var(--surface-muted)', radius: 4 }}
              isAnimationActive={false}
            />
            <Bar dataKey="total" fill="var(--chart-bar)" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Screen-reader table view of the same data */}
      <table className="sr-only">
        <caption>Spending per day</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((d) => d.total > 0)
            .map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{formatCurrency(d.total)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
