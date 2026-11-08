import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertDay, dayValidator, MAX_HISTORY_DAYS } from "./days";

const MIN_KG = 20;
const MAX_KG = 400;

const weighInValidator = v.object({ day: v.string(), weightKg: v.number() });

/** Saves the signed-in user's weight for a day, replacing any weigh-in already logged that day. */
export const log = mutation({
  args: { day: dayValidator, weightKg: v.number() },
  returns: v.null(),
  handler: async (ctx, { day, weightKg }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to log your weight.");
    assertDay(day);
    if (!Number.isFinite(weightKg) || weightKg < MIN_KG || weightKg > MAX_KG) {
      throw new Error(`Weight must be between ${MIN_KG} and ${MAX_KG} kg.`);
    }
    // One decimal, like the log sheet allows.
    const rounded = Math.round(weightKg * 10) / 10;

    const existing = await ctx.db
      .query("weighIns")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
      .unique();
    if (existing === null) {
      await ctx.db.insert("weighIns", { userId, day, weightKg: rounded });
    } else {
      await ctx.db.patch("weighIns", existing._id, { weightKg: rounded });
    }
    return null;
  },
});

/** The signed-in user's weigh-ins from `from` to `to` (inclusive), oldest first. Empty when signed out. */
export const history = query({
  args: { from: dayValidator, to: dayValidator },
  returns: v.array(weighInValidator),
  handler: async (ctx, { from, to }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    assertDay(from);
    assertDay(to);

    const rows = await ctx.db
      .query("weighIns")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).gte("day", from).lte("day", to))
      .take(MAX_HISTORY_DAYS);
    return rows.map(({ day, weightKg }) => ({ day, weightKg }));
  },
});

/** The signed-in user's most recent weigh-in, or null if they haven't logged one (or are signed out). */
export const latest = query({
  args: {},
  returns: v.union(weighInValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const row = await ctx.db
      .query("weighIns")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    return row === null ? null : { day: row.day, weightKg: row.weightKg };
  },
});
