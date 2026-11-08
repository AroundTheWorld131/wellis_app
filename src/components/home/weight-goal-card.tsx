import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useAnimatedProgress } from '@/hooks/use-animated-progress';
import { useBody, useGoalWeightKg } from '@/hooks/use-body';
import { useDailyWeight, useLatestWeight } from '@/hooks/use-weight';
import { dayKey, historyDayKeys } from '@/lib/days';

const BAR_COLOR = '#13c94e';
const BAR_HEIGHT = 10;
// Stages along the goal, one dot each, from the start of the bar to the end.
const STAGES = 5;
const DOT_SIZE = 4;
// How far the end dots sit in from the bar's ends. The five dots stay equally far apart.
const DOT_INSET = 24;

// "2026-08-10" → "Aug 10", or "Nov 9, 2025" when it's not this year.
function formatShortDay(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(year === new Date().getFullYear() ? {} : { year: 'numeric' }),
  });
}

// Rounded bar that fills left to right over a faint track in the same color, with a dot
// for each stage: white once the fill has reached it, faint green until then.
function ProgressBar({ progress }: { progress: number }) {
  const animatedProgress = useAnimatedProgress(progress);
  const fillStyle = useAnimatedStyle(() => ({ width: `${animatedProgress.value * 100}%` }));

  return (
    <View style={styles.barTrack}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BAR_COLOR, opacity: 0.12 }]} />
      <Animated.View style={[styles.barFill, fillStyle]} />
      <View style={styles.dots}>
        {Array.from({ length: STAGES }, (_, index) => {
          const reached = index / (STAGES - 1) <= progress;
          return <View key={index} style={[styles.dot, reached && styles.reachedDot]} />;
        })}
      </View>
    </View>
  );
}

// Home card for the user's weight goal: since their first weigh-in, how much they've lost
// (starting weight minus the latest weigh-in) and how far that is toward their goal weight.
export function WeightGoalCard() {
  const body = useBody();
  const latest = useLatestWeight();
  const daily = useDailyWeight();

  const startKg = body?.startingWeightKg;
  const targetKg = useGoalWeightKg();
  const lostKg =
    startKg !== undefined && latest ? Math.max(0, Math.round((startKg - latest.weightKg) * 10) / 10) : undefined;
  const toLoseKg = startKg !== undefined && targetKg !== undefined ? startKg - targetKg : undefined;
  const progress =
    lostKg !== undefined && toLoseKg !== undefined && toLoseKg > 0 ? Math.min(1, lostKg / toLoseKg) : 0;

  // The first day with a weigh-in in the chart history, like "Aug 10 to today".
  const firstIndex = daily ? daily.findIndex((value) => value !== null) : -1;
  const firstDay = firstIndex === -1 ? undefined : historyDayKeys(dayKey())[firstIndex];
  const span = firstDay ? `${formatShortDay(firstDay)} to today` : 'Log a weight to start';

  return (
    // Not pressable: nothing to open from here.
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>Weight goal</Text>
        <Text style={styles.cardSubtitle}>{span}</Text>
      </View>
      <View style={styles.lostRow}>
        <Text style={styles.lost}>{lostKg ?? '—'}</Text>
        <Text style={styles.lostUnit}>kg lost</Text>
      </View>
      <ProgressBar progress={progress} />
      <View style={styles.barFooter}>
        <Text style={styles.footerText}>{Math.round((1 - progress) * 100)}% to go</Text>
        <Text style={[styles.footerText, styles.targetText]}>
          {targetKg === undefined ? '—' : `${targetKg} kg target`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same white card as the Weight loss journey card.
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
  barTrack: {
    height: BAR_HEIGHT,
    marginTop: 16,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  // Square at its leading edge; the track's rounded, clipped ends still round the start.
  barFill: {
    height: '100%',
    backgroundColor: BAR_COLOR,
  },
  // Percent to go on the left, target weight on the right, under the bar.
  barFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Dark like the title, so the goal weight stands out.
  targetText: {
    color: '#262626',
    fontWeight: '600',
  },
  // Amount lost as a big number with a smaller grey unit, above the bar.
  lostRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  lost: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 40,
    color: '#262626',
  },
  lostUnit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 20,
    color: '#a3a3a3',
  },
  // Spread across the whole bar, equally far apart.
  dots: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DOT_INSET,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: BAR_COLOR,
    opacity: 0.35,
  },
  reachedDot: {
    backgroundColor: '#ffffff',
    opacity: 1,
  },
});
