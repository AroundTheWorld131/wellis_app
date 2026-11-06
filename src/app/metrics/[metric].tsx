import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { formatMetricValue, MetricChart, type MetricSelection } from '@/components/metrics/metric-chart';
import { RecentShots } from '@/components/metrics/recent-shots';
import { SwitchPicker } from '@/components/switch-picker';
import { METRIC_VIEWS } from '@/constants/metric-charts';
import { METRIC_ICONS, METRICS, type MetricKey } from '@/constants/metrics';

// One detail screen per Home card, opened as /metrics/weight, /metrics/water, and so on.
// Metrics with a chart lead with the selected value; the rest show their icon and title.
// TODO: logging and real history.
export default function MetricScreen() {
  const insets = useSafeAreaInsets();
  const { metric } = useLocalSearchParams<{ metric: string }>();
  const title = METRICS[metric as MetricKey] ?? 'Not found';
  const views = METRIC_VIEWS[metric as MetricKey];
  // Which view the switch is on, like Weight or BMI.
  const [viewIndex, setViewIndex] = useState(0);
  const view = views?.[viewIndex];
  // The point the chart is pointing at, shown as the big value.
  const [selection, setSelection] = useState<MetricSelection | null>(null);

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
            {selection ? (
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
                  {formatMetricValue(selection.value, view.series.decimals)}
                  {view.unit ? <Text style={styles.selectionUnit}> {view.unit}</Text> : null}
                </Text>
                <Text style={styles.selectionDate}>
                  {selection.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

        {view ? (
          <MetricChart
            series={view.series}
            color={view.color}
            toValue={view.toValue}
            onSelectionChange={setSelection}
            style={styles.chart}
          />
        ) : null}

        {metric === 'shot' ? <RecentShots count={10} style={styles.recentShots} /> : null}
      </ScrollView>
    </View>
  );
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
  recentShots: {
    marginTop: 32,
    marginHorizontal: 16,
  },
});
