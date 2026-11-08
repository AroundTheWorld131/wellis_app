import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const bodyValidator = v.object({
  startingWeightKg: v.optional(v.number()),
  heightCm: v.optional(v.number()),
});

/** The signed-in user's starting weight and height; either is missing until entered. Null when signed out. */
export const get = query({
  args: {},
  returns: v.union(bodyValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const body = await ctx.db
      .query("body")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (body === null) return {};

    return { startingWeightKg: body.startingWeightKg, heightCm: body.heightCm };
  },
});

/** Changes the signed-in user's starting weight and/or height, creating their row on the first save. */
export const update = mutation({
  args: bodyValidator.fields,
  returns: v.null(),
  handler: async (ctx, changes) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to change your details.");

    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        throw new Error(`${key} must be a positive number.`);
      }
    }

    const existing = await ctx.db
      .query("body")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing === null) {
      await ctx.db.insert("body", { userId, ...changes });
    } else {
      await ctx.db.patch("body", existing._id, changes);
    }
    return null;
  },
});
