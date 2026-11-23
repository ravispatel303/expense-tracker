import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { isSameMonth, monthKey, parseMonthKey, startOfCurrentMonth } from '../lib/dates';
import { useNow } from './useNow';

/** The selected month lives in the URL (?month=2026-11) so it survives reloads and can be shared. */
export function useMonthParam(): [Date, (month: Date) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get('month');
  const now = useNow();
  const month = useMemo(
    () => parseMonthKey(raw) ?? new Date(now.getFullYear(), now.getMonth(), 1),
    [raw, now],
  );

  const setMonth = useCallback(
    (next: Date) => {
      setParams(
        (p) => {
          const copy = new URLSearchParams(p);
          if (isSameMonth(next, startOfCurrentMonth())) copy.delete('month');
          else copy.set('month', monthKey(next));
          return copy;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return [month, setMonth];
}
