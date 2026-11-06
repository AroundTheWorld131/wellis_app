import type { Href } from 'expo-router';

// The metrics with their own detail screen, opened from the Home cards.
export const METRICS = {
  weight: 'Weight',
  shot: 'Shot',
  calories: 'Calories',
  water: 'Water',
  steps: 'Steps',
} as const;

export type MetricKey = keyof typeof METRICS;

// Same icons as the matching Home cards.
export const METRIC_ICONS: Record<MetricKey, number> = {
  weight: require('@/assets/images/cardIcons/weight.png'),
  shot: require('@/assets/images/cardIcons/shot.png'),
  calories: require('@/assets/images/cardIcons/calories.png'),
  water: require('@/assets/images/cardIcons/water.png'),
  steps: require('@/assets/images/cardIcons/steps.png'),
};

export function metricHref(metric: MetricKey): Href {
  return `/metrics/${metric}`;
}
