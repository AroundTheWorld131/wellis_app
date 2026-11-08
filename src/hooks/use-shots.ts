import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { mockShots, USE_MOCK_HISTORY } from '@/constants/mock-history';
import { dayKey, historyDayKeys } from '@/lib/days';
import { api } from '../../convex/_generated/api';

/**
 * Shot doses per day for the charts, oldest first and today last (HISTORY_DAYS long).
 * Days without a shot are null; a day with two shots shows their total.
 * Pass `enabled: false` to skip the query.
 * Undefined while loading; null when no shot was logged in the past year.
 * While USE_MOCK_HISTORY is on, this is the demo history instead of the user's logs.
 */
export function useDailyShots(enabled = true) {
  // Recomputed when the date changes, so the history rolls over at midnight.
  const today = dayKey();
  const days = useMemo(() => historyDayKeys(today), [today]);
  const rows = useQuery(
    api.shots.history,
    enabled && !USE_MOCK_HISTORY ? { from: days[0], to: days[days.length - 1] } : 'skip',
  );
  const mockRows = useMemo(() => (USE_MOCK_HISTORY ? mockShots(today) : undefined), [today]);
  const source = mockRows ?? rows;

  return useMemo(() => {
    if (source === undefined) return undefined;
    if (source.length === 0) return null;
    const byDay = new Map<string, number>();
    for (const row of source) byDay.set(row.day, (byDay.get(row.day) ?? 0) + row.doseMg);
    return days.map((day) => byDay.get(day) ?? null);
  }, [source, days]);
}

/** The most recent shots, newest first, or undefined while loading. */
export function useRecentShots(limit: number, enabled = true) {
  const today = dayKey();
  const recent = useQuery(api.shots.recent, enabled && !USE_MOCK_HISTORY ? { limit } : 'skip');
  const mockRecent = useMemo(
    () => (USE_MOCK_HISTORY ? mockShots(today).reverse().slice(0, Math.max(1, limit)) : undefined),
    [today, limit],
  );
  return USE_MOCK_HISTORY ? mockRecent : recent;
}
