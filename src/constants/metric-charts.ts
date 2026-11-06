import type { MetricSeries } from '@/components/metrics/metric-chart';
import type { MetricKey } from '@/constants/metrics';
import { SAMPLE_HEIGHT_CM } from '@/constants/sample-weigh-ins';

// What each metric detail screen charts. A screen with more than one view gets a switch
// above its value; each view has its own color, unit and placeholder history.
export type MetricView = {
  label: string;
  /** Main chart color, as a #rrggbb hex. */
  color: string;
  /** Shown after the value, like "kg". Empty for unitless values like BMI. */
  unit: string;
  series: MetricSeries;
  /** Turns the series' values into what to show, like weight into BMI. */
  toValue?: (value: number) => number;
  /** Shown above the value when this view is picked. Falls back to the metric's own icon. */
  icon?: number;
};

const WEIGHT_SERIES: MetricSeries = { end: 60, dropPerDay: 0.03, wobble: 0.25, decimals: 1 };

// BMI from a weight, using the placeholder height until onboarding asks for one.
const kgToBmi = (kg: number) => kg / (SAMPLE_HEIGHT_CM / 100) ** 2;

export const METRIC_VIEWS: Partial<Record<MetricKey, MetricView[]>> = {
  weight: [
    { label: 'Weight', color: '#8b7cf6', unit: 'kg', series: WEIGHT_SERIES },
    {
      label: 'BMI',
      color: '#8b7cf6',
      unit: '',
      series: WEIGHT_SERIES,
      toValue: kgToBmi,
      icon: require('@/assets/images/cardIcons/bmi.png'),
    },
  ],
  // Macro colors match the Calories card's bars on Home.
  calories: [
    {
      label: 'Calories',
      color: '#f0894b',
      unit: 'kcal',
      series: { end: 1950, dropPerDay: 0, wobble: 260, decimals: 0 },
    },
    {
      label: 'Carbs',
      color: '#f2b544',
      unit: 'g',
      icon: require('@/assets/images/cardIcons/carbs.png'),
      series: { end: 215, dropPerDay: 0, wobble: 45, decimals: 0 },
    },
    {
      label: 'Fats',
      color: '#ec7a8c',
      unit: 'g',
      icon: require('@/assets/images/cardIcons/fat.png'),
      series: { end: 64, dropPerDay: 0, wobble: 14, decimals: 0 },
    },
    {
      label: 'Protein',
      color: '#6bbf8a',
      unit: 'g',
      icon: require('@/assets/images/cardIcons/protein.png'),
      series: { end: 118, dropPerDay: 0, wobble: 22, decimals: 0 },
    },
  ],
  // Placeholder: the same 2.5 mg every week, matching the Home Shot card.
  shot: [
    {
      label: 'Shot',
      color: '#14919b',
      unit: 'mg',
      series: { end: 2.5, dropPerDay: 0, wobble: 0, decimals: 1 },
    },
  ],
  water: [
    {
      label: 'Water',
      color: '#4f8bec',
      unit: 'ml',
      series: { end: 2100, dropPerDay: 0, wobble: 380, decimals: 0 },
    },
  ],
  steps: [
    {
      label: 'Steps',
      color: '#6bbf8a',
      unit: 'steps',
      series: { end: 7800, dropPerDay: 0, wobble: 2100, decimals: 0 },
    },
  ],
};
