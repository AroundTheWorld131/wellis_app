import type { StyleProp, ViewStyle } from 'react-native';

import { formatHistoryDay, HistoryCard, HistoryList } from '@/components/metrics/history-card';
import { useDailyWater } from '@/hooks/use-water';
import { daysAgo } from '@/lib/days';

// One card per day for the last `count` days, newest first: the day and the water logged in
// Convex, 0 ml on days with nothing logged.
export function WaterHistory({ count = 30, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const dailyWater = useDailyWater();
  if (dailyWater === undefined) return null;

  // Today is last in the list, so walk back from the end.
  const recent = dailyWater.slice(-count).reverse();

  return (
    <HistoryList style={style}>
      {recent.map((ml, ago) => (
        <HistoryCard key={ago} title={formatHistoryDay(daysAgo(ago))} value={ml.toLocaleString('en-US')} unit="ml" />
      ))}
    </HistoryList>
  );
}
