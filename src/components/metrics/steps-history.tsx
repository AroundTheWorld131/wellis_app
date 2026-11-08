import type { StyleProp, ViewStyle } from 'react-native';

import { formatHistoryDay, HistoryCard, HistoryList } from '@/components/metrics/history-card';
import { useDailySteps } from '@/hooks/use-daily-steps';
import { daysAgo } from '@/lib/days';

// One card per day for the last `count` days, newest first: the day and its step total from
// Apple Health. Nothing without Health (Android, or before access is given).
export function StepsHistory({ count = 30, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const dailySteps = useDailySteps();
  if (dailySteps === null) return null;

  // Today is last in the list, so walk back from the end.
  const recent = dailySteps.slice(-count).reverse();

  return (
    <HistoryList style={style}>
      {recent.map((steps, ago) => (
        <HistoryCard
          key={ago}
          title={formatHistoryDay(daysAgo(ago))}
          value={steps.toLocaleString('en-US')}
          unit="steps"
        />
      ))}
    </HistoryList>
  );
}
