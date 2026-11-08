import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

// The signed-in user's app preferences. Notifications are on until the user turns them off.

async function settingsFor(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("settings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

/** Whether this user wants push notifications. Used before sending one. */
export async function notificationsEnabledFor(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return (await settingsFor(ctx, userId))?.notificationsEnabled ?? true;
}

/** The signed-in user's preferences. Null when signed out. */
export const get = query({
  args: {},
  returns: v.union(v.object({ notificationsEnabled: v.boolean() }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return { notificationsEnabled: await notificationsEnabledFor(ctx, userId) };
  },
});

/** Turns push notifications on or off for the signed-in user. */
export const setNotificationsEnabled = mutation({
  args: { enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { enabled }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to change your settings.");

    const existing = await settingsFor(ctx, userId);
    if (existing === null) {
      await ctx.db.insert("settings", { userId, notificationsEnabled: enabled });
    } else {
      await ctx.db.patch("settings", existing._id, { notificationsEnabled: enabled });
    }
    return null;
  },
});
