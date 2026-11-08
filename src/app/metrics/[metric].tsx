import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { formatMetricValue, MetricChart, type MetricSelection } from '@/components/metrics/metric-chart';
import { RecentShots } from '@/components/metrics/recent-shots';
import { StepsHistory } from '@/components/metrics/steps-history';
import { WaterHistory } from '@/components/metrics/water-history';
import { WeighInHistory } from '@/components/metrics/weigh-in-history';
import { SwitchPicker } from '@/components/switch-picker';
import { METRIC_VIEWS } from '@/constants/metric-charts';
import { METRIC_ICONS, METRICS, type MetricKey } from '@/constants/metrics';
import { useDailySteps } from '@/hooks/use-daily-steps';
import { useDailyWater } from '@/hooks/use-water';
import { useDailyWeight, useLatestWeight } from '@/hooks/use-weight';

// One detail screen per Home card, opened as /metrics/weight, /metrics/water, and so on.
// Metrics with a chart lead with the selected value; the rest show their icon and title.
// Weight and water chart what's logged in Convex; steps chart Apple Health. Shots have no
// chart (a weekly dose makes a flat, sparse line), just the list of every shot.
export default function MetricScreen() {
  const insets = useSafeAreaInsets();
  const { metric } = useLocalSearchParams<{ metric: string }>();
  const title = METRICS[metric as MetricKey] ?? 'Not found';
  const isShot = metric === 'shot';
  const views = isShot ? undefined : METRIC_VIEWS[metric as MetricKey];
  // Which view the switch is on, like Weight or BMI.
  const [viewIndex, setViewIndex] = useState(0);
  const view = views?.[viewIndex];
  // The point the chart is pointing at, shown as the big value.
  const [selection, setSelection] = useState<MetricSelection | null>(null);
  // Real daily values for the metrics that have them. Steps fall back to the placeholder
  // without Apple Health (null); weight and water are undefined while loading, and weight
  // is null before the first weigh-in.
  const dailySteps = useDailySteps();
  const dailyWater = useDailyWater(metric === 'water');
  const dailyWeight = useDailyWeight(metric === 'weight');
  const latestWeight = useLatestWeight(metric === 'weight');
  const daily =
    metric === 'steps'
      ? dailySteps
      : metric === 'water'
        ? dailyWater
        : metric === 'weight'
          ? dailyWeight
          : undefined;
  const loading = (metric === 'water' || metric === 'weight') && daily === undefined;
  const noWeighIns = metric === 'weight' && daily === null;
  // Weight with nothing pressed shows the latest weigh-in and the day it was logged.
  const latestDay = latestWeight?.day;
  const latestLabel = latestDay ? `Logged ${formatDay(latestDay)}` : undefined;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedButton onPress={() => router.back()} scaleTo={0.95} style={styles.backButton}>
          <SymbolView
            name="arrow.left"
            size={20}
            weight="medium"
            tintColor="#000"
            fallback={<Text style={styles.backFallback}>←</Text>}
          />
        </AnimatedButton>
      </View>

      {/* Everything under the back button scrolls, so long lists like recent shots fit. */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        {views && views.length > 1 ? (
          <SwitchPicker
            options={views.map((option) => option.label)}
            selectedIndex={viewIndex}
            onSelect={setViewIndex}
            style={styles.viewSwitch}
          />
        ) : null}

        {view ? (
          <View style={[styles.titleRow, styles.valueTitleRow]}>
            {/* <Image source={METRIC_ICONS[metric as MetricKey]} style={styles.titleIcon} contentFit="contain" /> */}
            {/* <Text style={styles.title}>{title}</Text> */}
            {selection && !loading && !noWeighIns ? (
              <View>
                {/* The picked view's own icon, like BMI's gauge, or the metric's icon. */}
                {(view.icon ?? METRIC_ICONS[metric as MetricKey]) ? (
                  <Image
                    source={view.icon ?? METRIC_ICONS[metric as MetricKey]}
                    style={styles.valueIcon}
                    contentFit="contain"
                  />
                ) : null}
                <Text style={[styles.title, styles.value]}>
                  {formatMetricValue(selection.value, view.series.decimals, view.series.trimZeros)}
                  {view.unit ? <Text style={styles.selectionUnit}> {view.unit}</Text> : null}
                </Text>
                <Text style={styles.selectionDate}>
                  {/* The day, days or month the point covers, like "January 2026" on 1Y. */}
                  {/* Weight is averaged, not summed, so it's an average rather than a daily one. */}
                  {selection.isAverage ? (metric === 'steps' || metric === 'water' ? 'Daily average · ' : 'Average · ') : ''}
                  {selection.periodLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.titleRow}>
            {METRIC_ICONS[metric as MetricKey] ? (
              <Image source={METRIC_ICONS[metric as MetricKey]} style={styles.titleIcon} contentFit="contain" />
            ) : null}
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        {view && noWeighIns ? (
          <Text style={styles.empty}>Log your first weight to see your progress here.</Text>
        ) : view && loading ? (
          // Holds the chart's space so the page doesn't jump when the data arrives.
          <View style={styles.chartPlaceholder} />
        ) : view ? (
          <MetricChart
            series={view.series}
            daily={daily}
            summary={metric === 'weight' ? 'latest' : 'average'}
            latestLabel={latestLabel}
            color={view.color}
            toValue={view.toValue}
            onSelectionChange={setSelection}
            style={styles.chart}
          />
        ) : null}

        {/* Every shot, newest first (the real query returns at most 50). */}
        {isShot ? <RecentShots count={100} style={styles.history} /> : null}
        {/* The last month of weigh-ins, daily steps or daily water under the chart. */}
        {metric === 'weight' || metric === 'steps' || metric === 'water' ? (
          <>
            <Text style={styles.sectionTitle}>Entries</Text>
            {metric === 'weight' ? (
              <WeighInHistory count={30} style={[styles.history, styles.entriesList]} />
            ) : metric === 'steps' ? (
              <StepsHistory count={30} style={[styles.history, styles.entriesList]} />
            ) : (
              <WaterHistory count={30} style={[styles.history, styles.entriesList]} />
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// "2026-11-05" → "Nov 5, 2026".
function formatDay(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Same round back button as the login and signup screens.
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    // Grey so it still stands out on the white page.
    backgroundColor: '#f6f6f9',
  },
  backFallback: {
    fontSize: 22,
    lineHeight: 24,
    color: '#000',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  viewSwitch: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  // More room above the value and less between it and the chart.
  valueTitleRow: {
    marginTop: 28,
    marginBottom: 0,
  },
  // Sits above the value, lined up with its left edge.
  valueIcon: {
    width: 26,
    height: 26,
    marginBottom: 2,
  },
  // The charted value, 18pt bigger than the plain titles.
  value: {
    fontSize: 50,
  },
  // Smaller and grey after the value, like "kg" on the Home cards.
  selectionUnit: {
    fontSize: 20,
    color: '#a3a3a3',
  },
  // Pulled up under the big value, which carries a lot of space below its digits.
  selectionDate: {
    marginTop: -6,
    fontSize: 13,
    fontWeight: '500',
    color: '#a3a3a3',
  },
  titleIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 32,
    color: '#262626',
  },
  chart: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  scroll: {
    flex: 1,
  },
  // The chart's height plus its range buttons.
  chartPlaceholder: {
    height: 330,
    marginTop: 20,
  },
  empty: {
    marginTop: 40,
    marginHorizontal: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#a3a3a3',
    textAlign: 'center',
  },
  // Same side margins as the Home cards.
  history: {
    marginTop: 16,
    marginHorizontal: 22,
  },
  // Like the Home page's "Today" heading, with room under the chart's range picker
  // (40 more than the shot list gets).
  // Close under the Entries heading.
  entriesList: {
    marginTop: 10,
  },
  sectionTitle: {
    marginTop: 56,
    marginHorizontal: 22,
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
});
