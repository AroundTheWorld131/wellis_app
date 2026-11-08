import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday" or "Wed, Oct 29". */
export function formatHistoryDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today.getTime() - day.getTime()) / DAY_MS);
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

type HistoryCardProps = {
  /** The day, like "Yesterday". */
  title: string;
  /** Under the title, like the time. */
  subtitle?: string;
  /** The big number. */
  value: string;
  unit: string;
  /** Grey line under the value, like the medication and site. */
  meta?: ReactNode;
  /** Darker text at the bottom, like a shot's note. */
  note?: string | null;
};

// One logged entry in a detail screen's history, styled like the Home cards (Last injection).
export function HistoryCard({ title, subtitle, value, unit, meta, note }: HistoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
        {/* Hints that each entry opens; nothing to open yet. TODO: entry detail. */}
        <SymbolView
          name="chevron.right"
          size={14}
          weight="semibold"
          tintColor="rgba(0, 0, 0, 0.3)"
          fallback={<Text style={styles.cardSubtitle}>›</Text>}
        />
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {note ? (
        <Text style={styles.note} numberOfLines={3}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

/** Stacks history cards with the Home cards' gap, or shows `empty` when there are none. */
export function HistoryList({
  empty,
  style,
  children,
}: {
  empty?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode[];
}) {
  if (children.length === 0) {
    return empty ? <Text style={[styles.empty, style]}>{empty}</Text> : null;
  }
  return <View style={[styles.list, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  // Same gap as between the Home cards.
  list: {
    gap: 8,
  },
  // Same white card as the Home cards.
  card: {
    padding: 20,
    borderRadius: 30,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 5,
  },
  // Title and subtitle on the left, chevron top right.
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: '#262626',
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Big number with a smaller grey unit beside it.
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 12,
  },
  value: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 40,
    color: '#262626',
  },
  unit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 20,
    color: '#a3a3a3',
  },
  meta: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  note: {
    marginTop: 10,
    fontSize: 15,
    color: '#525252',
  },
  empty: {
    fontSize: 17,
    fontWeight: '600',
    color: '#a3a3a3',
    textAlign: 'center',
  },
});
