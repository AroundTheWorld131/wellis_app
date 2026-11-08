import type { StyleProp, ViewStyle } from 'react-native';

import { formatHistoryDay, HistoryCard, HistoryList } from '@/components/metrics/history-card';
import { useRecentWeighIns } from '@/hooks/use-weight';

// "2026-11-05" → that local day.
function parseDay(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

// The change since the weigh-in before: "−0.4 kg", "+0.2 kg" or "0.0 kg". Nothing for the first.
function formatChange(changeKg: number | null) {
  if (changeKg === null) return undefined;
  const sign = changeKg < 0 ? '−' : changeKg > 0 ? '+' : '';
  return `${sign}${Math.abs(changeKg).toFixed(1)} kg`;
}

// One card per weigh-in, newest first: the day, the weight as the big number, and how much
// it moved since the weigh-in before.
export function WeighInHistory({ count = 30, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const weighIns = useRecentWeighIns(count);
  if (weighIns === undefined) return null;

  return (
    <HistoryList empty="No weigh-ins yet. Tap + on the Weight card to add one." style={style}>
      {weighIns.map((weighIn) => (
        <HistoryCard
          key={weighIn.day}
          title={formatHistoryDay(parseDay(weighIn.day))}
          value={weighIn.weightKg.toFixed(1)}
          unit="kg"
          meta={formatChange(weighIn.changeKg)}
        />
      ))}
    </HistoryList>
  );
}
