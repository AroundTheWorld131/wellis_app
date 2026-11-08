import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { assertDay, dayValidator, MAX_HISTORY_DAYS } from "./days";

/** No one drinks more than this in a day; stops a stuck button from running away. */
const MAX_DAY_ML = 20000;

async function requireUser(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Sign in to log water.");
  return userId;
}

// Writes a day's total, creating the row on the first glass and removing it at 0.
async function writeTotal(ctx: MutationCtx, userId: Id<"users">, day: string, totalMl: number) {
  const existing = await ctx.db
    .query("waterDays")
    .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
    .unique();
  if (totalMl === 0) {
    if (existing !== null) await ctx.db.delete("waterDays", existing._id);
  } else if (existing === null) {
    await ctx.db.insert("waterDays", { userId, day, totalMl });
  } else {
    await ctx.db.patch("waterDays", existing._id, { totalMl });
  }
}

/** Adds water to the signed-in user's total for a day, from the log sheet. */
export const add = mutation({
  args: { day: dayValidator, amountMl: v.number() },
  returns: v.null(),
  handler: async (ctx, { day, amountMl }) => {
    const userId = await requireUser(ctx);
    assertDay(day);
    if (!Number.isInteger(amountMl) || amountMl <= 0) {
      throw new Error("Water must be a positive whole number of ml.");
    }

    const existing = await ctx.db
      .query("waterDays")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
      .unique();
    await writeTotal(ctx, userId, day, Math.min((existing?.totalMl ?? 0) + amountMl, MAX_DAY_ML));
    return null;
  },
});

/** Sets the signed-in user's total for a day, from tapping the Home card's glasses. */
export const setTotal = mutation({
  args: { day: dayValidator, totalMl: v.number() },
  returns: v.null(),
  handler: async (ctx, { day, totalMl }) => {
    const userId = await requireUser(ctx);
    assertDay(day);
    if (!Number.isInteger(totalMl) || totalMl < 0 || totalMl > MAX_DAY_ML) {
      throw new Error(`Water must be a whole number of ml from 0 to ${MAX_DAY_ML}.`);
    }
    await writeTotal(ctx, userId, day, totalMl);
    return null;
  },
});

/** The signed-in user's daily totals from `from` to `to` (inclusive), oldest first. Days with no water are left out. */
export const history = query({
  args: { from: dayValidator, to: dayValidator },
  returns: v.array(v.object({ day: v.string(), totalMl: v.number() })),
  handler: async (ctx, { from, to }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    assertDay(from);
    assertDay(to);

    const rows = await ctx.db
      .query("waterDays")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).gte("day", from).lte("day", to))
      .take(MAX_HISTORY_DAYS);
    return rows.map(({ day, totalMl }) => ({ day, totalMl }));
  },
});
