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

type Range = 'W' | 'M' | '3M' | '6M' | '1Y';

// How many points each range shows, how far apart they are, and how to label them.
const RANGES: Record<Range, { points: number; stepDays: number; label: (date: Date) => string }> = {
  W: { points: 7, stepDays: 1, label: (date) => DAY_NAMES[date.getDay()] },
  M: { points: 10, stepDays: 3, label: (date) => String(date.getDate()) },
  '3M': { points: 13, stepDays: 7, label: (date) => MONTH_NAMES[date.getMonth()] },
  '6M': { points: 13, stepDays: 14, label: (date) => MONTH_NAMES[date.getMonth()] },
  '1Y': { points: 12, stepDays: 30, label: (date) => MONTH_NAMES[date.getMonth()][0] },
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
};

type Point = {
  // 0 for the oldest point up to the newest, so the chart's x axis stays numeric.
  index: number;
  value: number;
};

// The date at a position along the x axis; fractional positions fall between points.
function dateAt(range: Range, index: number) {
  const { points, stepDays } = RANGES[range];
  return new Date(Date.now() - (points - 1 - index) * stepDays * DAY_MS);
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

const Y_TICK_COUNT = 6;
// Round step sizes the y labels can use, from tenths of a kg up to thousands of steps.
const Y_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

// Six y labels exactly one round step apart, covering every value with room above and
// below so the highest and lowest dots don't sit on the chart's edge.
function evenYTicks(values: number[]) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const spans = Y_TICK_COUNT - 1;

  // The smallest step whose six labels still fit the values with half a step to spare.
  const step =
    Y_STEPS.find((candidate) => {
      const start = Math.floor((low - candidate / 2) / candidate) * candidate;
      return start + candidate * spans >= high + candidate / 2;
    }) ?? Y_STEPS[Y_STEPS.length - 1];

  // Center the values between the labels when the step leaves spare room.
  const lowest = Math.floor((low - step / 2) / step) * step;
  const spare = Math.floor((lowest + step * spans - high - step / 2) / step / 2);
  const start = lowest - Math.max(spare, 0) * step;

  // Rounding only removes float noise like 60.000000001; the values are already multiples of step.
  return Array.from({ length: Y_TICK_COUNT }, (_, index) => round(start + step * index, 1));
}

// Mixes a hex color into white, for the lighter press rule.
function lighten(hex: string, amount: number) {
  const channel = (offset: number) => parseInt(hex.slice(offset, offset + 2), 16);
  const mix = (value: number) => Math.round(255 - (255 - value) * amount);
  return `rgb(${mix(channel(1))}, ${mix(channel(3))}, ${mix(channel(5))})`;
}

/** Formats a value the way its chart labels it: one decimal, or a whole number with commas. */
export function formatMetricValue(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
}

export type MetricSelection = {
  value: number;
  date: Date;
  /** True while a finger is on the chart; false when showing the latest point. */
  pressed: boolean;
};

type MetricChartProps = {
  series: MetricSeries;
  /** Main color for the line and dots, as a #rrggbb hex. */
  color: string;
  /** Turns each value into what to plot, like weight into BMI. */
  toValue?: (value: number) => number;
  /** The point under the finger while dragging, otherwise the range's latest one. */
  onSelectionChange?: (selection: MetricSelection) => void;
  style?: StyleProp<ViewStyle>;
};

// Victory Native line chart over a chosen range, with a white-centered dot on each point
// and range buttons underneath. Press and drag to pick a point. No animations.
export function MetricChart({ series, color, toValue, onSelectionChange, style }: MetricChartProps) {
  const [range, setRange] = useState<Range>('W');
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
      samplePoints(range, series).map((point) =>
        toValue ? { ...point, value: round(toValue(point.value), series.decimals) } : point,
      ),
    [range, series, toValue],
  );
  const yTicks = useMemo(() => evenYTicks(data.map((point) => point.value)), [data]);
  const yStep = yTicks[1] - yTicks[0];
  const xTicks = useMemo(() => xTickPositions(range), [range]);

  // Report the pressed point, or the latest one when nothing is pressed.
  const selectedIndex = pressedIndex ?? data.length - 1;
  const selectedValue = data[selectedIndex]?.value;
  useEffect(() => {
    if (selectedValue === undefined) return;
    onSelectionChange?.({
      value: selectedValue,
      date: dateAt(range, selectedIndex),
      pressed: pressedIndex !== null,
    });
  }, [onSelectionChange, pressedIndex, range, selectedIndex, selectedValue]);
  // Short ranges get a dot per point; from 3M up only the first and last, so the line isn't crowded.
  const dotPoints = <T,>(all: T[]) =>
    SHORT_RANGES.includes(range) ? all : all.filter((_, i) => i === 0 || i === all.length - 1);

  return (
    <View style={style}>
      <View style={styles.chart}>
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
            x: [0, data.length - 1],
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
              // Without this Victory keeps only its default 5 of the 6 values.
              tickCount: yTicks.length,
              labelColor: LABEL_COLOR,
              lineColor: GRID_COLOR,
              lineWidth: 1.1,
              formatYLabel: (value) => formatMetricValue(value, series.decimals),
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
      </View>

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
  chart: {
    height: 260,
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
