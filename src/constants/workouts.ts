import type { ImageSource } from 'expo-image';

/**
 * Sample workouts for the Discover tab: short, beginner-friendly sessions that protect muscle
 * while losing weight. TODO: have the plans checked by a coach or the medical team, and move
 * them to Convex if they should change without an app release.
 */
export type Workout = {
  id: string;
  title: string;
  /** One line under the title. */
  summary: string;
  image: ImageSource | number;
  minutes: number;
  level: 'Beginner' | 'Intermediate';
  /** What the session needs, like "Dumbbells" or "Running shoes". */
  equipment: string;
  /** Each move, with sets and reps or a time. */
  exercises: { name: string; detail: string }[];
  /** Short tips shown under the exercises. */
  tips: string[];
};

export const WORKOUTS: Workout[] = [
  {
    id: 'outdoor-dumbbell',
    title: 'Outdoor full-body dumbbell',
    summary: 'One dumbbell, one mat, every muscle',
    image: require('@/assets/images/workouts/outdoor-dumbbell.jpg'),
    minutes: 25,
    level: 'Beginner',
    equipment: 'Mat and 1 dumbbell',
    exercises: [
      { name: 'Goblet squat', detail: '3 × 12' },
      { name: 'Single-arm row', detail: '3 × 10 each side' },
      { name: 'Bird dog', detail: '3 × 8 each side' },
      { name: 'Kneeling kickback', detail: '3 × 12 each side' },
      { name: 'Push-up (knees if needed)', detail: '3 × 8–10' },
    ],
    tips: [
      'Rest 45–60 seconds between sets.',
      'Pick a weight where the last two reps feel hard but your form holds.',
    ],
  },
  {
    id: 'floor-press-bridge',
    title: 'Floor press & glute bridge',
    summary: 'Chest, arms and glutes from the floor',
    image: require('@/assets/images/workouts/floor-press-bridge.jpg'),
    minutes: 20,
    level: 'Beginner',
    equipment: 'Mat and 2 dumbbells',
    exercises: [
      { name: 'Glute bridge floor press', detail: '3 × 10' },
      { name: 'Dumbbell glute bridge', detail: '3 × 15' },
      { name: 'Lying chest fly', detail: '3 × 10' },
      { name: 'Dead bug', detail: '3 × 8 each side' },
    ],
    tips: [
      'Hold your hips up and squeeze your glutes while you press.',
      'Lower the dumbbells slowly, over about three seconds.',
    ],
  },
  {
    id: 'easy-run',
    title: 'Easy run-walk intervals',
    summary: 'A gentle way back into running',
    image: require('@/assets/images/workouts/easy-run.jpg'),
    minutes: 20,
    level: 'Beginner',
    equipment: 'Running shoes',
    exercises: [
      { name: 'Brisk walk warm-up', detail: '5 min' },
      { name: 'Easy run, then walk', detail: '6 × (1 min run, 1½ min walk)' },
      { name: 'Walk cool-down', detail: '5 min' },
    ],
    tips: [
      'Run at a pace where you could still hold a conversation.',
      'Add 30 seconds to each run once it feels easy.',
    ],
  },
  {
    id: 'endurance-run',
    title: 'Steady endurance run',
    summary: 'Build stamina at a comfortable pace',
    image: require('@/assets/images/workouts/endurance-run.jpg'),
    minutes: 40,
    level: 'Intermediate',
    equipment: 'Running shoes',
    exercises: [
      { name: 'Easy jog warm-up', detail: '5 min' },
      { name: 'Steady run', detail: '30 min' },
      { name: 'Walk and stretch', detail: '5 min' },
    ],
    tips: [
      'Keep the whole run comfortable; you should be able to talk in full sentences.',
      'Drink water before you go, especially on GLP-1 medication.',
    ],
  },
];
