import { getAuthUserId } from "@convex-dev/auth/server";
import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { env, internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { notificationsEnabledFor } from "./settings";

// One conversation per patient with their care team. Patients only ever reach their own
// conversation: every public function looks it up from the signed-in user, never from an
// id the app sends. Staff replies come in through `replyAsStaff`, an internal function run
// from the Convex dashboard until there's a staff tool.

const MAX_TEXT_LENGTH = 2000;
const MAX_PREVIEW_LENGTH = 140;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PUSH_TOKEN_LENGTH = 200;
// Test-only auto-reply (CHAT_AUTO_REPLY=true): long enough to leave the app and see the push.
const AUTO_REPLY_DELAY_MS = 5000;
const AUTO_REPLY_TEXT = "Thanks for your message! This is an automatic test reply from your care team.";

const pushNotifications = new PushNotifications<Id<"users">>(components.pushNotifications);

const rateLimiter = new RateLimiter(components.rateLimiter, {
  // About one message every 3 seconds, with room for a quick burst of 5.
  sendMessage: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
});

const senderValidator = v.union(v.literal("patient"), v.literal("staff"));

const imageArgValidator = v.object({
  storageId: v.id("_storage"),
  width: v.number(),
  height: v.number(),
});

const staffValidator = v.object({
  name: v.string(),
  role: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
});

const messageValidator = v.object({
  _id: v.id("messages"),
  _creationTime: v.number(),
  sender: senderValidator,
  text: v.union(v.string(), v.null()),
  image: v.union(v.object({ url: v.string(), width: v.number(), height: v.number() }), v.null()),
});

// ---------------------------------------------------------------------------------------
// Helpers

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to use chat.");
  return userId;
}

async function conversationFor(ctx: QueryCtx | MutationCtx, patientId: Id<"users">) {
  return await ctx.db
    .query("conversations")
    .withIndex("by_patientId", (q) => q.eq("patientId", patientId))
    .unique();
}

async function staffDetails(ctx: QueryCtx, staffId: Id<"staff"> | undefined) {
  if (!staffId) return null;
  const staff = await ctx.db.get("staff", staffId);
  if (!staff) return null;
  return {
    name: staff.name,
    role: staff.role,
    avatarUrl: staff.avatarId ? await ctx.storage.getUrl(staff.avatarId) : null,
  };
}

// One line for the Chat tab: the text with its line breaks flattened, or "Photo".
function previewOf(text: string | undefined) {
  if (!text) return "Photo";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > MAX_PREVIEW_LENGTH ? `${flat.slice(0, MAX_PREVIEW_LENGTH - 1)}…` : flat;
}

function welcomeMessages(staff: Doc<"staff"> | null) {
  const firstName = staff?.name.split(" ")[0];
  return [
    firstName
      ? `Hi, welcome to Wellis! I'm ${firstName}, the ${staff!.role.toLowerCase()} on your care team. If you have any questions in the meantime, just ask them here – we're here for you!`
      : "Hi, welcome to Wellis! If you have any questions in the meantime, just ask them here – your care team is here for you!",
    "Our opening hours ⏰\nWeekdays: 07:00 – 22:00\nWeekends: 09:00 – 21:00",
  ];
}

// Opens the patient's conversation with the first care team member, who sends the welcome
// messages. They arrive unread, so the Chat tab shows the dot until the patient opens it.
async function createConversation(ctx: MutationCtx, patientId: Id<"users">) {
  const staff = await ctx.db.query("staff").first();
  const welcome = welcomeMessages(staff);
  const now = Date.now();

  const conversationId = await ctx.db.insert("conversations", {
    patientId,
    staffId: staff?._id,
    lastMessageAt: now,
    lastMessageText: previewOf(welcome[welcome.length - 1]),
    lastMessageSender: "staff",
    patientLastReadAt: 0,
  });
  for (const text of welcome) {
    await ctx.db.insert("messages", { conversationId, sender: "staff", staffId: staff?._id, text });
  }
  return conversationId;
}

function cleanText(text: string | undefined) {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new ConvexError(`Messages can be up to ${MAX_TEXT_LENGTH} characters.`);
  }
  return trimmed;
}

// Checks the photo was really uploaded, is an image and isn't huge.
async function checkImage(ctx: MutationCtx, image: Doc<"messages">["image"]) {
  if (!image) return;
  const file = await ctx.db.system.get("_storage", image.storageId);
  if (!file) throw new ConvexError("That photo didn't upload. Try again.");
  if (!file.contentType?.startsWith("image/")) throw new ConvexError("Only photos can be sent.");
  if (file.size > MAX_IMAGE_BYTES) throw new ConvexError("That photo is too large.");
  const sizes = [image.width, image.height];
  if (!sizes.every((size) => Number.isFinite(size) && size > 0 && size < 100_000)) {
    throw new ConvexError("That photo has an invalid size.");
  }
}

// ---------------------------------------------------------------------------------------
// Patient functions

/**
 * The signed-in patient's conversation for the Chat tab: who they're talking to, the last
 * message and whether it's unread. Null before the conversation exists or when signed out.
 */
export const myConversation = query({
  args: {},
  returns: v.union(
    v.object({
      staff: v.union(staffValidator, v.null()),
      lastMessageText: v.string(),
      lastMessageSender: senderValidator,
      lastMessageAt: v.number(),
      unread: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const conversation = await conversationFor(ctx, userId);
    if (!conversation) return null;
    return {
      staff: await staffDetails(ctx, conversation.staffId),
      lastMessageText: conversation.lastMessageText,
      lastMessageSender: conversation.lastMessageSender,
      lastMessageAt: conversation.lastMessageAt,
      unread:
        conversation.lastMessageSender === "staff" &&
        conversation.lastMessageAt > conversation.patientLastReadAt,
    };
  },
});

/** Makes sure the signed-in patient has a conversation, creating it with the welcome messages. */
export const start = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    if (!(await conversationFor(ctx, userId))) await createConversation(ctx, userId);
    return null;
  },
});

/** The signed-in patient's messages, newest first, a page at a time. */
export const listMessages = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(messageValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const conversation = userId === null ? null : await conversationFor(ctx, userId);
    if (!conversation) return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (message) => {
        const url = message.image ? await ctx.storage.getUrl(message.image.storageId) : null;
        return {
          _id: message._id,
          _creationTime: message._creationTime,
          sender: message.sender,
          text: message.text ?? null,
          image: message.image && url ? { url, width: message.image.width, height: message.image.height } : null,
        };
      }),
    );
    return { ...result, page };
  },
});

/** A one-time link the app uploads a photo to before sending it. */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Sends a message with text, an uploaded photo, or both, from the signed-in patient. */
export const send = mutation({
  args: { text: v.optional(v.string()), image: v.optional(imageArgValidator) },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const text = cleanText(args.text);
    if (!text && !args.image) throw new ConvexError("Write a message or add a photo.");
    await checkImage(ctx, args.image);
    await rateLimiter.limit(ctx, "sendMessage", { key: userId, throws: true });

    const conversationId = (await conversationFor(ctx, userId))?._id ?? (await createConversation(ctx, userId));
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      sender: "patient",
      text,
      image: args.image,
    });
    const now = Date.now();
    await ctx.db.patch("conversations", conversationId, {
      lastMessageAt: now,
      lastMessageText: previewOf(text),
      lastMessageSender: "patient",
      // Their own message counts as read.
      patientLastReadAt: now,
    });
    if (env.CHAT_AUTO_REPLY === "true") {
      await ctx.scheduler.runAfter(AUTO_REPLY_DELAY_MS, internal.chat.autoReply, { conversationId });
    }
    return messageId;
  },
});

/** Marks the signed-in patient's conversation as read, clearing the unread dot. */
export const markRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const conversation = await conversationFor(ctx, userId);
    if (conversation && conversation.patientLastReadAt < conversation.lastMessageAt) {
      await ctx.db.patch("conversations", conversation._id, { patientLastReadAt: Date.now() });
    }
    return null;
  },
});

/** Saves this phone's Expo push token, so the patient hears about care team replies. */
export const recordPushToken = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const token = args.token.trim();
    const looksLikeExpoToken = /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
    if (!looksLikeExpoToken || token.length > MAX_PUSH_TOKEN_LENGTH) {
      throw new ConvexError("That isn't an Expo push token.");
    }
    await pushNotifications.recordToken(ctx, { userId, pushToken: token });
    return null;
  },
});

// ---------------------------------------------------------------------------------------
// Care team functions, internal for now: run them from the Convex dashboard
// (Functions › chat) or with `npx convex run`.

/** Adds a care team member, like the nurse. New conversations go to the first one added. */
export const addStaff = internalMutation({
  args: { name: v.string(), role: v.string(), avatarId: v.optional(v.id("_storage")) },
  returns: v.id("staff"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("staff", { name: args.name.trim(), role: args.role.trim(), avatarId: args.avatarId });
  },
});

/**
 * Replies to a patient as their care team member and sends them a push notification. The
 * notification says only who wrote, never the message itself, so no health details show on
 * the lock screen.
 */
export const replyAsStaff = internalMutation({
  args: { conversationId: v.id("conversations"), text: v.string() },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get("conversations", args.conversationId);
    if (!conversation) throw new ConvexError("No conversation with that id.");
    const text = cleanText(args.text);
    if (!text) throw new ConvexError("Write a message.");
    return await sendStaffReply(ctx, conversation, text);
  },
});

/** The generic test reply scheduled by `send` while CHAT_AUTO_REPLY is on. */
export const autoReply = internalMutation({
  args: { conversationId: v.id("conversations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get("conversations", args.conversationId);
    if (conversation) await sendStaffReply(ctx, conversation, AUTO_REPLY_TEXT);
    return null;
  },
});

// Adds the staff message, moves the conversation's preview to it and sends the push.
async function sendStaffReply(ctx: MutationCtx, conversation: Doc<"conversations">, text: string) {
  const messageId = await ctx.db.insert("messages", {
    conversationId: conversation._id,
    sender: "staff",
    staffId: conversation.staffId,
    text,
  });
  await ctx.db.patch("conversations", conversation._id, {
    lastMessageAt: Date.now(),
    lastMessageText: previewOf(text),
    lastMessageSender: "staff",
  });

  // Patients who turned notifications off in Profile still get the message in the app.
  if (!(await notificationsEnabledFor(ctx, conversation.patientId))) return messageId;

  const staff = conversation.staffId ? await ctx.db.get("staff", conversation.staffId) : null;
  await pushNotifications.sendPushNotification(ctx, {
    userId: conversation.patientId,
    notification: {
      title: staff?.name ?? "Wellis",
      body: "You have a new message from your care team.",
      sound: "default",
      data: { url: "/chat/care" },
    },
    // Patients who never allowed notifications still get the message in the app.
    allowUnregisteredTokens: true,
  });
  return messageId;
}
