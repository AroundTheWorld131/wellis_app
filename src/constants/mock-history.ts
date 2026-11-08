import { INJECTION_SITES } from '@/constants/shots';
import { dayKey } from '@/lib/days';
import type { Id } from '../../convex/_generated/dataModel';

// MVP demo history: the same year of weigh-ins and shots for every user. The weight and shot
// hooks show only this and ignore what users log (logs are still saved to Convex).
// Dates count back from the user's today, so it always covers their last 12 months.
// Values come from fixed formulas, not randomness, so everyone sees exactly the same numbers.
// Set to false to show users' real logs instead.
export const USE_MOCK_HISTORY = true;

/** How many days of demo history there are, today included: the charts' full year. */
const HISTORY_DAYS = 365;
const LATEST_KG = 81.2;
const TOTAL_LOST_KG = 17.4;

// The weight `ago` days before today: a steady loss that's a little faster early on, plus
// day-to-day wobble. Exactly LATEST_KG today, since sin(0) is 0.
function weightDaysAgo(ago: number) {
  const trend = TOTAL_LOST_KG * (ago / (HISTORY_DAYS - 1)) ** 0.85;
  const wobble = 0.35 * Math.sin(ago * 1.7) + 0.2 * Math.sin(ago * 0.45);
  return Math.round((LATEST_KG + trend + wobble) * 10) / 10;
}

// Demo body details shown on Profile while USE_MOCK_HISTORY is on. The starting weight is the
// first demo weigh-in (98.7 kg); the height is the one BMI is worked out from.
export const MOCK_STARTING_WEIGHT_KG = weightDaysAgo(HISTORY_DAYS - 1);
export const MOCK_HEIGHT_CM = 175;
// The demo weight goal, shown on Home's Weight goal card and Profile's Goals card.
export const MOCK_GOAL_WEIGHT_KG = 75;

// Weekly shots, the latest 2 days ago, so the week chart always has one: 52 in all.
const SHOT_EVERY_DAYS = 7;
const LATEST_SHOT_DAYS_AGO = 2;
const SHOT_COUNT = Math.floor((HISTORY_DAYS - 1 - LATEST_SHOT_DAYS_AGO) / SHOT_EVERY_DAYS) + 1;

// Mounjaro's usual step-up: [dose mg, weeks on it]. The last step runs to today.
const DOSE_STEPS: [number, number][] = [
  [2.5, 4],
  [5, 4],
  [7.5, 4],
  [10, 8],
  [12.5, 8],
  [15, Infinity],
];

// The dose for the `week`th shot (0 = the first one).
function doseForWeek(week: number) {
  let weeksLeft = week;
  for (const [dose, weeks] of DOSE_STEPS) {
    if (weeksLeft < weeks) return dose;
    weeksLeft -= weeks;
  }
  return DOSE_STEPS[DOSE_STEPS.length - 1][0];
}

// A few notes along the way, by shot number. The rest have none.
const NOTES: Record<number, string> = {
  0: 'First shot! A bit nervous but it was painless.',
  2: 'Mild nausea in the evening.',
  4: 'Stepped up to 5 mg.',
  7: 'Appetite much smaller this week.',
  8: 'Moved up to 7.5 mg.',
  12: 'Up to 10 mg. Drinking more water helps.',
  17: 'Clothes fitting looser.',
  20: 'Stepped up to 12.5 mg.',
  25: 'Energy is way up, walking every day.',
  28: 'Now on 15 mg.',
  38: 'Down over 10 kg since starting!',
  50: 'Feeling great, best I have felt in years.',
};

export type MockShot = {
  _id: Id<'shots'>;
  takenAt: number;
  day: string;
  medication: string;
  doseMg: number;
  site: string;
  note: string | null;
};

// The local day `ago` days before `today` ("YYYY-MM-DD"), the user's own calendar day.
function daysBefore(today: string, ago: number) {
  const [year, month, day] = today.split('-').map(Number);
  return new Date(year, month - 1, day - ago);
}

/** The demo weigh-ins, oldest first: one every day for the last year, today included. */
export function mockWeighIns(today: string): { day: string; weightKg: number }[] {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const ago = HISTORY_DAYS - 1 - index;
    return { day: dayKey(daysBefore(today, ago)), weightKg: weightDaysAgo(ago) };
  });
}

/** The demo shots, oldest first: weekly over the last year, the latest 2 days ago. */
export function mockShots(today: string): MockShot[] {
  return Array.from({ length: SHOT_COUNT }, (_, week) => {
    const ago = LATEST_SHOT_DAYS_AGO + (SHOT_COUNT - 1 - week) * SHOT_EVERY_DAYS;
    const date = daysBefore(today, ago);
    // Mornings between 8 and 10, on the hour or half past.
    date.setHours(8 + (week % 3), week % 2 === 0 ? 0 : 30, 0, 0);
    return {
      // Never sent to Convex; only used as a list key.
      _id: `mock-shot-${ago}` as Id<'shots'>,
      takenAt: date.getTime(),
      day: dayKey(date),
      medication: 'Mounjaro',
      doseMg: doseForWeek(week),
      // Rotates through the sites, like the shot log suggests.
      site: INJECTION_SITES[week % INJECTION_SITES.length],
      note: NOTES[week] ?? null,
    };
  });
}
