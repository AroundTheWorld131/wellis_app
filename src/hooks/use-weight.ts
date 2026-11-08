import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { mockWeighIns, USE_MOCK_HISTORY } from '@/constants/mock-history';
import { dayKey, historyDayKeys } from '@/lib/days';
import { api } from '../../convex/_generated/api';

// Every weigh-in in the chart history, oldest first, or undefined while loading (or skipped).
// While USE_MOCK_HISTORY is on, the demo history instead of the user's logs.
function useWeighInRows(enabled: boolean) {
  // Recomputed when the date changes, so the history rolls over at midnight.
  const today = dayKey();
  const days = useMemo(() => historyDayKeys(today), [today]);
  // Skipped (and left undefined) when the screen doesn't need it.
  const rows = useQuery(
    api.weight.history,
    enabled && !USE_MOCK_HISTORY ? { from: days[0], to: days[days.length - 1] } : 'skip',
  );
  const mockRows = useMemo(() => (USE_MOCK_HISTORY ? mockWeighIns(today) : undefined), [today]);
  return { days, rows: mockRows ?? rows };
}

/**
 * Weight per day for the charts, oldest first and today last (HISTORY_DAYS long).
 * Days without a weigh-in are null, so the charts only plot days the user actually weighed in.
 * Pass `enabled: false` to skip the query.
 * Undefined while loading; null when nothing has been logged in the past year.
 */
export function useDailyWeight(enabled = true) {
  const { days, rows } = useWeighInRows(enabled);

  return useMemo(() => {
    if (rows === undefined) return undefined;
    if (rows.length === 0) return null;
    const byDay = new Map(rows.map((row) => [row.day, row.weightKg]));
    return days.map((day) => byDay.get(day) ?? null);
  }, [rows, days]);
}

/**
 * The latest `limit` weigh-ins, newest first, each with the change since the weigh-in
 * before it (null for the first one ever). Undefined while loading.
 */
export function useRecentWeighIns(limit: number, enabled = true) {
  const { rows } = useWeighInRows(enabled);

  return useMemo(() => {
    if (rows === undefined) return undefined;
    const start = Math.max(rows.length - limit, 0);
    return rows
      .slice(start)
      .map((row, index) => {
        const previous = rows[start + index - 1];
        return {
          ...row,
          changeKg: previous ? Math.round((row.weightKg - previous.weightKg) * 10) / 10 : null,
        };
      })
      .reverse();
  }, [rows, limit]);
}

/** The most recent weigh-in, null if none, or undefined while loading. */
export function useLatestWeight(enabled = true) {
  const today = dayKey();
  const latest = useQuery(api.weight.latest, enabled && !USE_MOCK_HISTORY ? {} : 'skip');
  const mockLatest = useMemo(() => (USE_MOCK_HISTORY ? (mockWeighIns(today).at(-1) ?? null) : undefined), [today]);
  return USE_MOCK_HISTORY ? mockLatest : latest;
}
