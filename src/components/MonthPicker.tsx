import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { addMonths, isSameMonth, startOfCurrentMonth } from '../lib/dates';
import { formatMonth } from '../lib/format';

interface MonthPickerProps {
  month: Date;
  onChange: (month: Date) => void;
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  const now = useNow();
  const isCurrent = isSameMonth(month, now);
  return (
    <div className="border-border bg-surface inline-flex items-center gap-1 rounded-xl border p-1">
      <button
        type="button"
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Previous month"
        className="text-text-muted hover:bg-surface-muted hover:text-text grid size-8 place-items-center rounded-lg"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-32 text-center text-sm font-semibold" aria-live="polite">
        {formatMonth(month)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addMonths(month, 1))}
        aria-label="Next month"
        className="text-text-muted hover:bg-surface-muted hover:text-text grid size-8 place-items-center rounded-lg"
      >
        <ChevronRight className="size-4" />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => onChange(startOfCurrentMonth())}
          className="text-primary hover:bg-primary-soft rounded-lg px-2.5 py-1 text-xs font-semibold"
        >
          This month
        </button>
      )}
    </div>
  );
}
