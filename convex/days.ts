import { v } from "convex/values";

/** A local calendar day, "YYYY-MM-DD". The client sends it, since only it knows the user's time zone. */
export const dayValidator = v.string();

// Throws unless `day` looks like "2026-11-07". Days sort correctly as strings in this form.
export function assertDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error(`Expected a day like 2026-11-07, got "${day}".`);
  }
}

/** A year of daily rows, plus a little room. */
export const MAX_HISTORY_DAYS = 400;
