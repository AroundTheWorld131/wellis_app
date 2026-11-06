import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type Shot = {
  date: Date;
  doseMg: number;
  site: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
// Rotating sites like a typical weekly schedule.
const SITES = [
  'Stomach, upper left',
  'Stomach, upper right',
  'Thigh, left',
  'Thigh, right',
  'Arm, left',
  'Arm, right',
];

// Placeholder: one 2.5 mg shot a week at 12:39, newest first, matching the Home Shot card.
// TODO: show logged shots.
function sampleShots(count: number): Shot[] {
  const latest = new Date();
  latest.setHours(12, 39, 0, 0);
  return Array.from({ length: count }, (_, index) => ({
    date: new Date(latest.getTime() - index * 7 * DAY_MS),
    doseMg: 2.5,
    site: SITES[index % SITES.length],
  }));
}

// "Today", "Yesterday" or "Wed, Oct 29".
function formatDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today.getTime() - day.getTime()) / DAY_MS);
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// One card per recent shot: the day, the dose as the big number, and when and where.
export function RecentShots({ count = 10, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const shots = sampleShots(count);

  return (
    <View style={[styles.list, style]}>
      {shots.map((shot) => (
        <View key={shot.date.getTime()} style={styles.card}>
          <Text style={styles.title}>{formatDay(shot.date)}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{shot.doseMg}</Text>
            <Text style={styles.unit}>mg</Text>
          </View>
          <Text style={styles.meta}>
            {formatTime(shot.date)} · {shot.site}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
  // Grey cards, since the detail screen is white.
  card: {
    gap: 6,
    backgroundColor: '#f6f6f9',
    borderRadius: 32,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 36,
    color: '#262626',
  },
  unit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 22,
    color: '#c4c4c4',
  },
  meta: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#a3a3a3',
  },
});
