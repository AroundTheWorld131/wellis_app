import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertDay, dayValidator } from "./days";

const MAX_NOTE_LENGTH = 1000;
const MAX_TEXT_LENGTH = 100;
/** A daily injection for a year, plus room. */
const MAX_HISTORY_SHOTS = 500;
const MAX_RECENT_SHOTS = 50;

const shotValidator = v.object({
  _id: v.id("shots"),
  takenAt: v.number(),
  day: v.string(),
  medication: v.string(),
  doseMg: v.number(),
  site: v.string(),
  note: v.union(v.string(), v.null()),
});

/** Saves a shot for the signed-in user. */
export const log = mutation({
  args: {
    takenAt: v.number(),
    day: dayValidator,
    medication: v.string(),
    doseMg: v.number(),
    site: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.id("shots"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to log a shot.");
    assertDay(args.day);

    // A few minutes of slack for clocks that disagree; anything later hasn't happened yet.
    if (!Number.isFinite(args.takenAt) || args.takenAt > Date.now() + 5 * 60 * 1000) {
      throw new Error("That time hasn't happened yet.");
    }
    if (!Number.isFinite(args.doseMg) || args.doseMg <= 0 || args.doseMg > 100) {
      throw new Error("Dose must be between 0 and 100 mg.");
    }
    const medication = args.medication.trim();
    const site = args.site.trim();
    if (!medication || medication.length > MAX_TEXT_LENGTH) throw new Error("Pick a medication.");
    if (!site || site.length > MAX_TEXT_LENGTH) throw new Error("Pick an injection site.");
    const note = args.note?.trim();
    if (note && note.length > MAX_NOTE_LENGTH) {
      throw new Error(`Notes can be up to ${MAX_NOTE_LENGTH} characters.`);
    }

    return await ctx.db.insert("shots", {
      userId,
      takenAt: args.takenAt,
      day: args.day,
      medication,
      doseMg: args.doseMg,
      site,
      ...(note ? { note } : {}),
    });
  },
});

/** The signed-in user's most recent shots, newest first. Empty when signed out. */
export const recent = query({
  args: { limit: v.number() },
  returns: v.array(shotValidator),
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const rows = await ctx.db
      .query("shots")
      .withIndex("by_userId_and_takenAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(Math.max(1, Math.min(Math.floor(limit), MAX_RECENT_SHOTS)));
    return rows.map(({ _id, takenAt, day, medication, doseMg, site, note }) => ({
      _id,
      takenAt,
      day,
      medication,
      doseMg,
      site,
      note: note ?? null,
    }));
  },
});

/** The signed-in user's shots from `from` to `to` (inclusive days), oldest first, for the charts. */
export const history = query({
  args: { from: dayValidator, to: dayValidator },
  returns: v.array(v.object({ day: v.string(), doseMg: v.number() })),
  handler: async (ctx, { from, to }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    assertDay(from);
    assertDay(to);

    const rows = await ctx.db
      .query("shots")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).gte("day", from).lte("day", to))
      .take(MAX_HISTORY_SHOTS);
    return rows.map(({ day, doseMg }) => ({ day, doseMg }));
  },
});
