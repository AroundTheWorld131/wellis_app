import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';
import { formatMetricValue, MetricChart } from '@/components/metrics/metric-chart';
import { METRIC_VIEWS } from '@/constants/metric-charts';
import { metricHref } from '@/constants/metrics';
import { useDailyWeight, useLatestWeight } from '@/hooks/use-weight';

const WEIGHT_VIEW = METRIC_VIEWS.weight![0];
// Same BMI as the weight detail screen. TODO: it uses a placeholder height until one is saved.
const kgToBmi = METRIC_VIEWS.weight![1].toValue!;
const CHART_HEIGHT = 130;

// Home card with the latest weight, BMI and this month's chart under a title and chevron.
export function WeightJourneyCard() {
  // Undefined while loading, null before the first weigh-in.
  const dailyWeight = useDailyWeight();
  // The most recent weigh-in: undefined while loading, null before the first one.
  const latestWeight = useLatestWeight();

  return (
    // Opens the weight detail screen.
    <AnimatedButton onPress={() => router.push(metricHref('weight'))} disableAnimation style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Weight loss journey</Text>
          <Text style={styles.cardSubtitle}>This month</Text>
        </View>
        <SymbolView
          name="chevron.right"
          size={14}
          weight="semibold"
          tintColor="rgba(0, 0, 0, 0.3)"
          fallback={<Text style={styles.cardSubtitle}>›</Text>}
        />
      </View>
      {latestWeight === null ? null : (
        // Weight and BMI side by side, each in a half-width column so both start at the same
        // place. A dash while loading. Trailing zeros dropped, so 65.0 shows as 65.
        <View style={styles.numbers}>
          <View style={styles.numberRow}>
            <Text style={styles.weight}>
              {latestWeight === undefined ? '—' : formatMetricValue(latestWeight.weightKg, 1, true)}
            </Text>
            <Text style={styles.weightUnit}>kg</Text>
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.weight}>
              {latestWeight === undefined ? '—' : formatMetricValue(kgToBmi(latestWeight.weightKg), 1, true)}
            </Text>
            <Text style={styles.weightUnit}>BMI</Text>
          </View>
        </View>
      )}
      {dailyWeight === null ? (
        <Text style={styles.empty}>Log your first weight to see your progress here.</Text>
      ) : dailyWeight === undefined ? (
        // Holds the chart's space so the card doesn't jump when the data arrives.
        <View style={styles.chartPlaceholder} />
      ) : (
        // Display only: touches pass through, so the chart can't be pressed or scrubbed.
        <View pointerEvents="none">
          <MetricChart
            series={WEIGHT_VIEW.series}
            daily={dailyWeight}
            summary="latest"
            color={WEIGHT_VIEW.color}
            defaultRange="M"
            showRanges={false}
            height={CHART_HEIGHT}
            yTickCount={4}
            style={styles.chart}
          />
        </View>
      )}
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  // White card: title, subtitle and chevron on top, this month's weight chart below.
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
  chart: {
    marginTop: 2,
  },
  chartPlaceholder: {
    height: CHART_HEIGHT,
    marginTop: 16,
  },
  empty: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  // Latest weight and BMI, above the chart.
  numbers: {
    flexDirection: 'row',
    marginTop: 6,
  },
  // A big number with a smaller grey unit, in a half-width column.
  numberRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  weight: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 40,
    color: '#262626',
  },
  weightUnit: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 20,
    color: '#a3a3a3',
  },
});
