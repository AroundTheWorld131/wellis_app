import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { metricHref } from '@/constants/metrics';
import { useRecentShots } from '@/hooks/use-shots';

// "Nov 1, 9:00 AM", in the user's own time zone.
function formatTakenAt(takenAt: number) {
  const date = new Date(takenAt);
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${time}`;
}

// Home card for the user's most recent shot: when it was taken, the dose and where it went.
// Dashes while loading and before the first shot.
export function LastInjectionCard() {
  const lastShot = useRecentShots(1)?.[0];

  return (
    // Opens the shot detail screen.
    <AnimatedButton onPress={() => router.push(metricHref('shot'))} disableAnimation style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Last injection</Text>
          <Text style={styles.cardSubtitle}>{lastShot ? formatTakenAt(lastShot.takenAt) : '—'}</Text>
        </View>
        <SymbolView
          name="chevron.right"
          size={14}
          weight="semibold"
          tintColor="rgba(0, 0, 0, 0.3)"
          fallback={<Text style={styles.cardSubtitle}>›</Text>}
        />
      </View>
      <View style={styles.doseRow}>
        <Text style={styles.dose}>{lastShot ? lastShot.doseMg : '—'}</Text>
        <Text style={styles.doseUnit}>mg</Text>
      </View>
      <Text style={styles.site}>{lastShot?.site ?? ' '}</Text>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  // Same white card as the other Home cards.
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
  // Big dose number with a smaller grey unit beside it.
  doseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 12,
  },
  dose: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 40,
    color: '#262626',
  },
  doseUnit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 20,
    color: '#a3a3a3',
  },
  // Where the shot went, under the dose.
  site: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
