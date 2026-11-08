import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Starting targets for a new account, the same numbers the app showed as placeholders.
const DEFAULT_GOALS = {
  weightKg: 60,
  waterMl: 2500,
  steps: 10000,
};

const goalsValidator = v.object({
  weightKg: v.number(),
  waterMl: v.number(),
  steps: v.number(),
});

/** The signed-in user's goals, or the defaults until they've saved any. Null when signed out. */
export const get = query({
  args: {},
  returns: v.union(goalsValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (goals === null) return DEFAULT_GOALS;

    return {
      weightKg: goals.weightKg,
      waterMl: goals.waterMl,
      steps: goals.steps,
    };
  },
});

/** Changes some of the signed-in user's goals, creating their row on the first save. */
export const update = mutation({
  args: goalsValidator.partial().fields,
  returns: v.null(),
  handler: async (ctx, changes) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to change your goals.");

    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        throw new Error(`${key} must be a positive number.`);
      }
    }

    const existing = await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing === null) {
      await ctx.db.insert("goals", { userId, ...DEFAULT_GOALS, ...changes });
    } else {
      await ctx.db.patch("goals", existing._id, changes);
    }
    return null;
  },
});
