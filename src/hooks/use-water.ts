import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { dayKey, historyDayKeys } from '@/lib/days';
import { api } from '../../convex/_generated/api';

/**
 * Logged water per day from Convex, oldest first and today last (HISTORY_DAYS long),
 * with 0 on days nothing was logged. Undefined while loading.
 */
export function useDailyWater(enabled = true) {
  // Recomputed when the date changes, so the history rolls over at midnight.
  const today = dayKey();
  const days = useMemo(() => historyDayKeys(today), [today]);
  // Skipped (and left undefined) when the screen doesn't need it.
  const rows = useQuery(api.water.history, enabled ? { from: days[0], to: days[days.length - 1] } : 'skip');

  return useMemo(() => {
    if (rows === undefined) return undefined;
    const totals = new Map(rows.map((row) => [row.day, row.totalMl]));
    return days.map((day) => totals.get(day) ?? 0);
  }, [rows, days]);
}

/** Water logged today in ml, or undefined while loading. */
export function useTodayWater() {
  const today = dayKey();
  const rows = useQuery(api.water.history, { from: today, to: today });
  return rows === undefined ? undefined : (rows[0]?.totalMl ?? 0);
}
