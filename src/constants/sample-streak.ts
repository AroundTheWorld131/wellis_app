// Placeholder streak until weigh-ins are saved: every day this week up to today
// counts as logged. Shared by the Home badge and the streak screen.
// TODO: work this out from logged weights.

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type StreakDay = {
  letter: string;
  isToday: boolean;
  logged: boolean;
};

export function sampleStreakWeek(): { days: StreakDay[]; streak: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // getDay() is 0 for Sunday; shift so Monday is 0.
  const todayIndex = (today.getDay() + 6) % 7;
  const monday = new Date(today.getTime() - todayIndex * DAY_MS);

  const days = DAY_LETTERS.map((letter, index) => ({
    letter,
    isToday: new Date(monday.getTime() + index * DAY_MS).getTime() === today.getTime(),
    logged: index <= todayIndex,
  }));
  return { days, streak: todayIndex + 1 };
}
