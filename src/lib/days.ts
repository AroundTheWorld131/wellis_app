// Local calendar days as "YYYY-MM-DD", the form Convex stores entries under.

/** The local calendar day of `date`, like "2026-11-07". */
export function dayKey(date: Date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The local day `count` days back from today. */
export function daysAgo(count: number) {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return date;
}

/** The days the charts cover, oldest first and today last: a year, like the steps history. */
export const HISTORY_DAYS = 365;

/** Every day key in the chart history ending on `lastDay` ("YYYY-MM-DD"), oldest first. */
export function historyDayKeys(lastDay: string) {
  const [year, month, day] = lastDay.split('-').map(Number);
  return Array.from({ length: HISTORY_DAYS }, (_, index) =>
    dayKey(new Date(year, month - 1, day - (HISTORY_DAYS - 1 - index))),
  );
}
