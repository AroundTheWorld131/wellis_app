import type { StyleProp, ViewStyle } from 'react-native';

import { formatHistoryDay, HistoryCard, HistoryList } from '@/components/metrics/history-card';
import { useRecentShots } from '@/hooks/use-shots';

// "9:00 AM", like the Last injection card.
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// One card per logged shot, newest first: the day and time, the dose as the big number, then
// the medication and site, and the note if there is one.
export function RecentShots({ count = 10, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const shots = useRecentShots(count);
  if (shots === undefined) return null;

  return (
    <HistoryList empty="No shots logged yet. Tap + on the Shot card to add one." style={style}>
      {shots.map((shot) => {
        const takenAt = new Date(shot.takenAt);
        return (
          <HistoryCard
            key={shot._id}
            title={formatHistoryDay(takenAt)}
            subtitle={formatTime(takenAt)}
            value={String(shot.doseMg)}
            unit="mg"
            meta={`${shot.medication} · ${shot.site}`}
            note={shot.note}
          />
        );
      })}
    </HistoryList>
  );
}
