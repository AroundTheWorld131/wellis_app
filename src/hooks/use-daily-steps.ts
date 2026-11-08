import {
  isHealthDataAvailable,
  queryStatisticsCollectionForQuantity,
  requestAuthorization,
  subscribeToChanges,
} from '@kingstinct/react-native-healthkit';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

const STEP_COUNT = 'HKQuantityTypeIdentifierStepCount';
/** How many days of step totals we keep: enough for the chart's 1Y range. */
export const STEP_HISTORY_DAYS = 365;

/**
 * Daily step totals from Apple Health, oldest first and today last, always
 * STEP_HISTORY_DAYS long. Null while loading, or when Health isn't available
 * (Android, web, iPad without Health).
 */
export type DailySteps = number[] | null;

// One store shared by every screen, so Home, Progress and the detail screen don't
// each ask Health and keep their own observer.
let dailySteps: DailySteps = null;
const listeners = new Set<() => void>();
let started = false;

function setDailySteps(next: number[]) {
  dailySteps = next;
  listeners.forEach((listener) => listener());
}

// Local midnight `daysAgo` days back.
function startOfDay(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function loadSteps() {
  const firstDay = startOfDay(STEP_HISTORY_DAYS - 1);
  // One cumulative sum per calendar day, anchored at midnight so buckets match local days.
  const buckets = await queryStatisticsCollectionForQuantity(STEP_COUNT, ['cumulativeSum'], firstDay, { day: 1 }, {
    filter: { date: { startDate: firstDay } },
    unit: 'count',
  });

  // Health only returns days that have steps; the rest stay 0.
  const days = new Array<number>(STEP_HISTORY_DAYS).fill(0);
  for (const bucket of buckets) {
    if (!bucket.startDate) continue;
    const bucketDay = new Date(bucket.startDate);
    bucketDay.setHours(0, 0, 0, 0);
    // Rounded so a daylight saving change doesn't shift a day.
    const index = Math.round((bucketDay.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    if (index >= 0 && index < STEP_HISTORY_DAYS) {
      days[index] = Math.round(bucket.sumQuantity?.quantity ?? 0);
    }
  }
  setDailySteps(days);
}

function refresh() {
  loadSteps().catch((error) => console.warn('Could not read steps from Apple Health', error));
}

// Asks for read access once, loads the history, then reloads whenever Health gets new steps.
async function start() {
  if (started || Platform.OS !== 'ios' || !isHealthDataAvailable()) return;
  started = true;
  try {
    // Shows the Health sheet the first time only. iOS never says whether reading was
    // allowed: if it wasn't, the queries just come back empty.
    await requestAuthorization({ toRead: [STEP_COUNT] });
    refresh();
    subscribeToChanges(STEP_COUNT, refresh);
  } catch (error) {
    started = false;
    console.warn('Could not connect to Apple Health', error);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => dailySteps;

/** Daily step totals from Apple Health; see DailySteps. */
export function useDailySteps(): DailySteps {
  useEffect(() => {
    void start();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Today's steps, or null while loading or without Health. */
export function useTodaySteps() {
  const days = useDailySteps();
  return days ? days[days.length - 1] : null;
}
