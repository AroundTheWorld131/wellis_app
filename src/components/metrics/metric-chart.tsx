import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAnimatedReaction, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { Circle, Line as SkiaLine, matchFont, vec } from 'react-native-skia';
import { CartesianChart, Line, Scatter, useChartPressState } from 'victory-native';
import { scheduleOnRN } from 'react-native-worklets';

import { AnimatedButton } from '@/components/animated-button';

const LABEL_COLOR = '#a3a3a3';
const GRID_COLOR = 'rgba(0, 0, 0, 0.05)';
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Plain system font for the axis labels. Skia matches it by family name.
const AXIS_FONT = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
  fontSize: 12,
  fontWeight: '400',
});

export type ChartRange = 'W' | 'M' | '3M' | '6M' | '1Y';
type Range = ChartRange;

// How many points each range shows, how far apart they are, and how to label them.
// `monthly` points are calendar months (stepDays is then only the placeholder's spacing).
const RANGES: Record<
  Range,
  { points: number; stepDays: number; monthly?: boolean; label: (date: Date) => string }
> = {
  W: { points: 7, stepDays: 1, label: (date) => DAY_NAMES[date.getDay()] },
  M: { points: 10, stepDays: 3, label: (date) => String(date.getDate()) },
  '3M': { points: 13, stepDays: 7, label: (date) => MONTH_NAMES[date.getMonth()] },
  '6M': { points: 13, stepDays: 14, label: (date) => MONTH_NAMES[date.getMonth()] },
  '1Y': { points: 12, stepDays: 30, monthly: true, label: (date) => MONTH_NAMES[date.getMonth()][0] },
};

const RANGE_KEYS = Object.keys(RANGES) as Range[];
const SHORT_RANGES: Range[] = ['W', 'M'];

/** Shape of a metric's placeholder history. TODO: replace with logged data. */
export type MetricSeries = {
  /** Today's value; every range ends here. */
  end: number;
  /** How much the value drops per day going forward, so older points sit higher (weight loss). */
  dropPerDay: number;
  /** How far points swing around the trend, so it looks like real data. */
  wobble: number;
  /** Decimals to round values and labels to. */
  decimals: number;
  /** Drops trailing zeros from values and labels: 2.5 rather than 2.50 (shots). */
  trimZeros?: boolean;
};

type Point = {
  // 0 for the oldest point up to the newest, so the chart's x axis stays numeric.
  index: number;
  value: number;
};

// The date at a position along the x axis; fractional positions fall between points.
// For monthly ranges, the 1st of that point's month.
function dateAt(range: Range, index: number) {
  const { points, stepDays, monthly } = RANGES[range];
  if (monthly) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - (points - 1 - Math.round(index)), 1);
  }
  return new Date(Date.now() - (points - 1 - index) * stepDays * DAY_MS);
}

// The first and last day a point covers: one day on W, a run of days on M/3M/6M,
// and the whole month (up to today) on 1Y.
function periodAt(range: Range, index: number) {
  const { stepDays, monthly } = RANGES[range];
  const date = dateAt(range, index);
  if (monthly) {
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: date, end: monthEnd.getTime() > Date.now() ? new Date() : monthEnd };
  }
  return { start: new Date(date.getTime() - (stepDays - 1) * DAY_MS), end: date };
}

// What the selected point stands for, like "November 7, 2026", "Oct 5 – 7, 2026" or
// "January 2026".
function periodLabel(range: Range, index: number) {
  const { start, end } = periodAt(range, index);
  if (RANGES[range].monthly) {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (RANGES[range].stepDays === 1) {
    return end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return daySpanLabel(start, end);
}

// The whole range's first to last day, for the summary shown when nothing is pressed:
// "Nov 1 – 7, 2026" on W, "Dec 2025 – Nov 2026" on 1Y.
function rangePeriod(range: Range) {
  const start = periodAt(range, 0).start;
  const end = periodAt(range, RANGES[range].points - 1).end;
  const label = RANGES[range].monthly
    ? `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : daySpanLabel(start, end);
  return { start, end, label };
}

/** Daily values, oldest first and today last. Null marks a day with nothing logged (weight). */
export type DailyValues = (number | null)[];

// Daily average over every day from `start` to `end` that has a value; null if none do.
function averageOver(daily: DailyValues, start: Date, end: Date, decimals: number) {
  const today = new Date();
  const todayIndex = daily.length - 1;
  const first = todayIndex - daysBetween(start, today);
  const last = todayIndex - daysBetween(end, today);
  const days = daily
    .slice(Math.max(first, 0), Math.max(last + 1, 0))
    .filter((value): value is number => value !== null);
  return days.length ? round(days.reduce((sum, value) => sum + value, 0) / days.length, decimals) : null;
}

// "Oct 5 – 7, 2026", "Oct 29 – Nov 4, 2026" or "Dec 29, 2025 – Jan 4, 2026".
function daySpanLabel(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const from = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const to = end.toLocaleDateString('en-US', {
    // Leave the month off the end when the run stays inside one month: "Oct 5 – 7".
    ...(start.getMonth() === end.getMonth() && sameYear ? {} : { month: 'short' }),
    day: 'numeric',
    year: 'numeric',
  });
  return `${from} – ${to}`;
}

// Days between two dates, counting calendar days so daylight saving doesn't shift it.
function daysBetween(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

// Where along the x axis each label goes. 3M and 6M label the 1st of every month, so the
// months are evenly spaced; the other ranges label every point.
function xTickPositions(range: Range) {
  const { points, stepDays } = RANGES[range];
  if (range !== '3M' && range !== '6M') {
    return Array.from({ length: points }, (_, index) => index);
  }
  const first = dateAt(range, 0);
  const positions: number[] = [];
  const monthStart = new Date(first.getFullYear(), first.getMonth() + 1, 1);
  while (monthStart.getTime() <= Date.now()) {
    positions.push(points - 1 - (Date.now() - monthStart.getTime()) / (stepDays * DAY_MS));
    monthStart.setMonth(monthStart.getMonth() + 1);
  }
  return positions;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Placeholder points ending at `series.end` today: an optional downward trend plus a
// steady, repeatable swing so every visit draws the same line.
function samplePoints(range: Range, series: MetricSeries): Point[] {
  const { points, stepDays } = RANGES[range];

  return Array.from({ length: points }, (_, index) => {
    const stepsAgo = points - 1 - index;
    const trend = stepsAgo * stepDays * series.dropPerDay;
    const swing = stepsAgo === 0 ? 0 : series.wobble * Math.sin(index * 2.1 + 0.6);
    return { index, value: round(series.end + trend + swing, series.decimals) };
  });
}

// Real points from daily values (oldest first, today last). A point covering several days,
// like M's every-third-day points or a 1Y month, shows the average over those days.
// Periods with nothing logged get no point at all, so the line only joins real entries.
function dailyPoints(range: Range, daily: DailyValues, decimals: number): Point[] {
  return Array.from({ length: RANGES[range].points }, (_, index) => {
    const { start, end } = periodAt(range, index);
    return { index, value: averageOver(daily, start, end, decimals) };
  }).filter((point): point is Point => point.value !== null);
}

// The most recent logged value, or undefined if nothing is logged.
function latestValue(daily: DailyValues) {
  for (let index = daily.length - 1; index >= 0; index--) {
    const value = daily[index];
    if (value !== null) return value;
  }
  return undefined;
}

const DEFAULT_Y_TICK_COUNT = 6;
// Round step sizes the y labels can use, from tenths of a kg up to thousands of steps.
const Y_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000];

// `count` y labels exactly one round step apart, covering every value with room above and
// below so the highest and lowest dots don't sit on the chart's edge. Every metric is
// zero or more, so the labels never go below 0: a day with 0 steps sits on the 0 label.
function evenYTicks(values: number[], count: number, decimals: number) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const spans = count - 1;
  // The bottom label for a step: half a step under the lowest value, but not below 0.
  const bottomLabel = (step: number) => Math.max(Math.floor((low - step / 2) / step) * step, 0);

  // The smallest step whose labels still fit the values with half a step to spare. Steps
  // finer than the labels' decimals are skipped, so a flat line at 0 steps doesn't get
  // labels like "0, 0, 1".
  const step =
    Y_STEPS.find((candidate) => {
      if (candidate < 10 ** -decimals) return false;
      return bottomLabel(candidate) + candidate * spans >= high + candidate / 2;
    }) ?? Y_STEPS[Y_STEPS.length - 1];

  // Center the values between the labels when the step leaves spare room, still not below 0.
  const lowest = bottomLabel(step);
  const spare = Math.floor((lowest + step * spans - high - step / 2) / step / 2);
  const start = Math.max(lowest - Math.max(spare, 0) * step, 0);

  // Rounding only removes float noise like 60.000000001; the values are already multiples of step.
  return Array.from({ length: count }, (_, index) => round(start + step * index, 1));
}

// Mixes a hex color into white, for the lighter press rule.
function lighten(hex: string, amount: number) {
  const channel = (offset: number) => parseInt(hex.slice(offset, offset + 2), 16);
  const mix = (value: number) => Math.round(255 - (255 - value) * amount);
  return `rgb(${mix(channel(1))}, ${mix(channel(3))}, ${mix(channel(5))})`;
}

/**
 * Formats a value the way its chart labels it: `decimals` places, or a whole number with
 * commas. With `trimZeros`, trailing zeros are dropped, so 2.50 shows as 2.5 and 5.00 as 5.
 */
export function formatMetricValue(value: number, decimals: number, trimZeros = false) {
  if (decimals === 0) return Math.round(value).toLocaleString('en-US');
  const fixed = value.toFixed(decimals);
  return trimZeros ? String(Number(fixed)) : fixed;
}

export type MetricSelection = {
  value: number;
  date: Date;
  /** The day, run of days or month the point covers, ready to show under the value. */
  periodLabel: string;
  /** True when the value is a daily average over several days rather than one day's total. */
  isAverage: boolean;
  /** True while a finger is on the chart; false when showing the latest point. */
  pressed: boolean;
};

type MetricChartProps = {
  series: MetricSeries;
  /**
   * Real daily totals, oldest first and today last (a year's worth covers every range).
   * Replaces the placeholder history when given; `series` then only sets the decimals.
   */
  daily?: DailyValues | null;
  /**
   * What to show with nothing pressed, when `daily` is given: the daily average over the
   * range (steps, water), or the latest value (weight).
   */
  summary?: 'average' | 'latest';
  /** For `latest`, when that value was logged, like "Logged Nov 5". Defaults to today's date. */
  latestLabel?: string;
  /** Main color for the line and dots, as a #rrggbb hex. */
  color: string;
  /** Turns each value into what to plot, like weight into BMI. */
  toValue?: (value: number) => number;
  /** The point under the finger while dragging, otherwise the range's latest one. */
  onSelectionChange?: (selection: MetricSelection) => void;
  /** Shows the W/M/3M/6M/1Y buttons. Off keeps the chart on `defaultRange`. */
  showRanges?: boolean;
  /** The range the chart opens on. Defaults to the week. */
  defaultRange?: ChartRange;
  /** Height of the plot area, labels included. */
  height?: number;
  /** How many y axis labels to show. */
  yTickCount?: number;
  style?: StyleProp<ViewStyle>;
};

// Victory Native line chart over a chosen range, with a white-centered dot on each point
// and range buttons underneath. Press and drag to pick a point. No animations.
export function MetricChart({
  series,
  daily,
  summary = 'average',
  latestLabel,
  color,
  toValue,
  onSelectionChange,
  showRanges = true,
  defaultRange = 'W',
  height = 260,
  yTickCount = DEFAULT_Y_TICK_COUNT,
  style,
}: MetricChartProps) {
  const [range, setRange] = useState<Range>(defaultRange);
  const { state: pressState, isActive: isPressing } = useChartPressState({ x: 0, y: { value: 0 } });
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const ruleColor = useMemo(() => lighten(color, 0.35), [color]);

  // The point nearest the finger lives on the UI thread; hand it to React only when it changes.
  useAnimatedReaction(
    () => (pressState.isActive.value ? pressState.matchedIndex.value : -1),
    (index, previous) => {
      if (index !== previous) {
        scheduleOnRN(setPressedIndex, index >= 0 ? index : null);
        // A light tick each time the finger reaches a new point, like scrubbing a picker.
        if (index >= 0) {
          scheduleOnRN(selectionTick);
        }
      }
    },
  );

  const data = useMemo(
    () =>
      (daily ? dailyPoints(range, daily, series.decimals) : samplePoints(range, series)).map((point) =>
        toValue ? { ...point, value: round(toValue(point.value), series.decimals) } : point,
      ),
    [range, series, toValue, daily],
  );
  // With no entries in this range (like a week without weigh-ins), center the labels on
  // the latest value so the empty chart still has a sensible scale.
  const fallbackValue = useMemo(() => {
    const latest = daily ? latestValue(daily) : undefined;
    if (latest === undefined) return 0;
    return toValue ? round(toValue(latest), series.decimals) : latest;
  }, [daily, toValue, series.decimals]);
  const yTicks = useMemo(
    () =>
      evenYTicks(data.length ? data.map((point) => point.value) : [fallbackValue], yTickCount, series.decimals),
    [data, fallbackValue, yTickCount, series.decimals],
  );
  const yStep = yTicks[1] - yTicks[0];
  const xTicks = useMemo(() => xTickPositions(range), [range]);

  // Report the pressed point, or the latest one when nothing is pressed. Points can skip
  // positions, so `selectedPosition` is where on the x axis the selected point sits.
  const selectedIndex = pressedIndex ?? data.length - 1;
  const selectedValue = data[selectedIndex]?.value;
  const selectedPosition = data[selectedIndex]?.index ?? 0;
  useEffect(() => {
    const shown = (value: number) => (toValue ? round(toValue(value), series.decimals) : value);
    // With real daily values and nothing pressed, sum up the whole range: the daily average
    // over every day it shows, or for `latest` the most recent entry (like current weight).
    // Placeholder histories keep showing their latest reading.
    if (daily && pressedIndex === null) {
      const latest = latestValue(daily);
      if (summary === 'latest' && latest !== undefined) {
        onSelectionChange?.({
          value: shown(latest),
          date: new Date(),
          periodLabel: latestLabel ?? periodLabel('W', RANGES.W.points - 1),
          isAverage: false,
          pressed: false,
        });
        return;
      }
      const whole = rangePeriod(range);
      onSelectionChange?.({
        value: shown(averageOver(daily, whole.start, whole.end, series.decimals) ?? 0),
        date: whole.end,
        periodLabel: whole.label,
        isAverage: true,
        pressed: false,
      });
      return;
    }
    if (selectedValue === undefined) return;
    onSelectionChange?.({
      value: selectedValue,
      date: dateAt(range, selectedPosition),
      periodLabel: periodLabel(range, selectedPosition),
      // A pressed W point is one day's total; longer ranges' points are daily averages.
      isAverage: Boolean(daily) && range !== 'W',
      pressed: pressedIndex !== null,
    });
  }, [
    daily,
    latestLabel,
    onSelectionChange,
    pressedIndex,
    range,
    selectedPosition,
    selectedValue,
    series.decimals,
    summary,
    toValue,
  ]);
  // Short ranges get a dot per point; from 3M up only the first and last, so the line isn't crowded.
  const dotPoints = <T,>(all: T[]) =>
    SHORT_RANGES.includes(range) ? all : all.filter((_, i) => i === 0 || i === all.length - 1);

  return (
    <View style={style}>
      <View style={{ height }}>
        {/* Victory draws a stray "undefined" label with no points, so an empty range gets a note. */}
        {data.length === 0 ? (
          <View style={styles.emptyRange}>
            <Text style={styles.emptyRangeText}>Nothing logged in this period</Text>
          </View>
        ) : (
        <CartesianChart
          data={data}
          chartPressState={pressState}
          xKey="index"
          yKeys={['value']}
          // Room so the end dots don't touch the edges.
          domainPadding={{ left: 16, right: 16 }}
          // Room under the bottom labels so letters like the "g" in "Aug" aren't cut off.
          padding={{ bottom: 8 }}
          domain={{
            // Every point. Without this Victory sizes the x range to the month labels,
            // and points before the first or after the last label fall outside the chart.
            x: [0, RANGES[range].points - 1],
            // Slightly past the outer labels: Victory hides a label that sits exactly on the
            // chart's top or bottom edge.
            y: [yTicks[0] - yStep * 0.4, yTicks[yTicks.length - 1] + yStep * 0.4],
          }}
          xAxis={{
            font: AXIS_FONT,
            tickValues: xTicks,
            // Without this Victory drops labels down to its default count.
            tickCount: xTicks.length,
            labelColor: LABEL_COLOR,
            lineColor: 'transparent',
            formatXLabel: (index) => RANGES[range].label(dateAt(range, index)),
          }}
          yAxis={[
            {
              font: AXIS_FONT,
              tickValues: yTicks,
              // Without this Victory keeps only its default 5 values.
              tickCount: yTicks.length,
              labelColor: LABEL_COLOR,
              lineColor: GRID_COLOR,
              lineWidth: 1.1,
              formatYLabel: (value) => formatMetricValue(value, series.decimals, series.trimZeros),
            },
          ]}>
          {({ points, chartBounds }) => (
            <>
              <Line
                points={points.value}
                color={color}
                strokeWidth={3}
                // Straight segments between points, no smoothing.
                curveType="linear"
              />
              {/* White fill under a colored ring, so each point is a white-centered dot. */}
              <Scatter points={dotPoints(points.value)} radius={6} color="#ffffff" />
              <Scatter
                points={dotPoints(points.value)}
                radius={5}
                color={color}
                style="stroke"
                strokeWidth={2.5}
              />
              {/* Follows the finger while pressing: a rule and a bigger white-centered dot. */}
              {isPressing ? (
                <>
                  <PressRule
                    x={pressState.x.position}
                    top={chartBounds.top}
                    bottom={chartBounds.bottom}
                    color={ruleColor}
                  />
                  <Circle cx={pressState.x.position} cy={pressState.y.value.position} r={8} color="#ffffff" />
                  <Circle
                    cx={pressState.x.position}
                    cy={pressState.y.value.position}
                    r={7}
                    color={color}
                    style="stroke"
                    strokeWidth={3}
                  />
                </>
              ) : null}
            </>
          )}
        </CartesianChart>
        )}
      </View>

      {showRanges ? (
        <View style={styles.ranges}>
          {RANGE_KEYS.map((key) => {
            const selected = key === range;
            return (
              <AnimatedButton
                key={key}
                onPress={() => setRange(key)}
                disableAnimation
                style={[styles.rangeButton, selected && styles.selectedRangeButton]}>
                <Text style={[styles.rangeText, selected && styles.selectedRangeText]}>{key}</Text>
              </AnimatedButton>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function selectionTick() {
  void Haptics.selectionAsync();
}

// Vertical line through the chart at the pressed point.
function PressRule({
  x,
  top,
  bottom,
  color,
}: {
  x: SharedValue<number>;
  top: number;
  bottom: number;
  color: string;
}) {
  const start = useDerivedValue(() => vec(x.value, top));
  const end = useDerivedValue(() => vec(x.value, bottom));
  return <SkiaLine p1={start} p2={end} color={color} strokeWidth={1.5} />;
}

const styles = StyleSheet.create({
  emptyRange: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRangeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  ranges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
  },
  rangeButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Only the active range gets a background.
  selectedRangeButton: {
    backgroundColor: '#f2f2f6',
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  selectedRangeText: {
    color: '#262626',
  },
});
