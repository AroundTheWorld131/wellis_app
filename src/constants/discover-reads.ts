import type { ImageSource } from 'expo-image';
import type { SFSymbol } from 'expo-symbols';

/**
 * Articles and mental health topics for the Discover tab. No detail screens yet. TODO: write
 * the content (and have it medically reviewed), and add photos to the ones without.
 */
export type DiscoverRead = {
  id: string;
  title: string;
  /** Grey line under the title, like '4 min'. */
  meta: string;
  /** Photo on the tile. Without one, the tile shows `tint` and `symbol`. */
  image?: ImageSource | number;
  /** Soft background until a photo is added. */
  tint: string;
  symbol: SFSymbol;
};

export const ARTICLES: DiscoverRead[] = [
  {
    id: 'how-glp1-works',
    title: 'How GLP-1 medication works',
    image: require('@/assets/images/articles/pen-hand.jpg'),
    meta: '4 min',
    tint: '#e3eef0',
    symbol: 'cross.vial',
  },
  {
    id: 'eating-with-less-appetite',
    title: 'Eating well with less appetite',
    image: require('@/assets/images/articles/chia-pudding.jpg'),
    meta: '5 min',
    tint: '#eef0e6',
    symbol: 'fork.knife',
  },
  {
    id: 'managing-nausea',
    title: 'Managing nausea in the first weeks',
    image: require('@/assets/images/articles/flower-tea.jpg'),
    meta: '3 min',
    tint: '#f1ebe2',
    symbol: 'heart.text.square',
  },
  {
    id: 'why-protein-matters',
    title: 'Why protein matters while losing weight',
    image: require('@/assets/images/articles/pen-flatlay.jpg'),
    meta: '4 min',
    tint: '#f5e9dc',
    symbol: 'figure.strengthtraining.traditional',
  },
  {
    id: 'keeping-weight-off',
    title: 'Keeping the weight off for good',
    image: require('@/assets/images/articles/mountain-path.jpg'),
    meta: '6 min',
    tint: '#e8e6f2',
    symbol: 'chart.line.downtrend.xyaxis',
  },
];

export const MENTAL_HEALTH: DiscoverRead[] = [
  {
    id: 'emotional-eating',
    title: 'Emotional eating',
    image: require('@/assets/images/mental-health/oranges.jpg'),
    meta: '4 min',
    tint: '#f1ebe2',
    symbol: 'heart',
  },
  {
    id: 'food-noise',
    title: 'Quieting food noise',
    image: require('@/assets/images/mental-health/swans.jpg'),
    meta: '4 min',
    tint: '#e3eef0',
    symbol: 'brain.head.profile',
  },
  {
    id: 'body-image',
    title: 'Body image on your journey',
    image: require('@/assets/images/mental-health/flowers.jpg'),
    meta: '5 min',
    tint: '#f3e6ea',
    symbol: 'figure.stand',
  },
  {
    id: 'stress-and-weight',
    title: 'Stress and your weight',
    image: require('@/assets/images/mental-health/hills.jpg'),
    meta: '4 min',
    tint: '#e7efe3',
    symbol: 'leaf',
  },
  {
    id: 'motivation',
    title: 'Staying motivated on hard days',
    image: require('@/assets/images/mental-health/parrots.jpg'),
    meta: '3 min',
    tint: '#f5e9dc',
    symbol: 'sun.max',
  },
  {
    id: 'sleep-and-mood',
    title: 'Sleep, mood and appetite',
    meta: '5 min',
    tint: '#e8e6f2',
    symbol: 'moon.stars',
  },
];
