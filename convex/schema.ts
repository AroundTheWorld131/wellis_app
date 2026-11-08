import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users, sessions and accounts for Convex Auth.
  ...authTables,

  // One row per user with their daily targets, shown in Profile → Goals.
  goals: defineTable({
    userId: v.id("users"),
    weightKg: v.number(),
    waterMl: v.number(),
    steps: v.number(),
  }).index("by_userId", ["userId"]),

  // One row per user with their body details, shown in Profile → Body. Each is unset
  // until the user enters it.
  body: defineTable({
    userId: v.id("users"),
    startingWeightKg: v.optional(v.number()),
    heightCm: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  // One row per user with their app preferences, shown in Profile → Account. No row
  // means the defaults: notifications on.
  settings: defineTable({
    userId: v.id("users"),
    notificationsEnabled: v.boolean(),
  }).index("by_userId", ["userId"]),

  // One weigh-in per user per day; logging again that day replaces it.
  // `day` is the user's local calendar day, "YYYY-MM-DD".
  weighIns: defineTable({
    userId: v.id("users"),
    day: v.string(),
    weightKg: v.number(),
  }).index("by_userId_and_day", ["userId", "day"]),

  // Water drunk per user per day, as a running total. The log sheet adds to it and the
  // Home card's glasses set it.
  waterDays: defineTable({
    userId: v.id("users"),
    day: v.string(),
    totalMl: v.number(),
  }).index("by_userId_and_day", ["userId", "day"]),

  // One row per injection. `takenAt` is when it was given (ms since epoch); `day` is that
  // moment's local calendar day, "YYYY-MM-DD", for the charts.
  shots: defineTable({
    userId: v.id("users"),
    takenAt: v.number(),
    day: v.string(),
    medication: v.string(),
    doseMg: v.number(),
    site: v.string(),
    note: v.optional(v.string()),
  })
    .index("by_userId_and_takenAt", ["userId", "takenAt"])
    .index("by_userId_and_day", ["userId", "day"]),

  // Members of the care team who chat with patients, like the nurse. `userId` links a staff
  // login once there's a staff tool; until then replies are sent from the dashboard.
  staff: defineTable({
    name: v.string(),
    /** Shown under the name, like "Nurse". */
    role: v.string(),
    userId: v.optional(v.id("users")),
    avatarId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  // One conversation per patient with their care team. The last message is copied here so
  // the Chat tab can show its preview and unread dot without reading the messages.
  conversations: defineTable({
    patientId: v.id("users"),
    /** The staff member the patient sees in the header and on replies. */
    staffId: v.optional(v.id("staff")),
    lastMessageAt: v.number(),
    lastMessageText: v.string(),
    lastMessageSender: v.union(v.literal("patient"), v.literal("staff")),
    /** When the patient last had the conversation open, for the unread dot. */
    patientLastReadAt: v.number(),
  })
    .index("by_patientId", ["patientId"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // Chat messages. Every message has text, a photo, or both.
  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.union(v.literal("patient"), v.literal("staff")),
    /** Which staff member wrote it, for staff messages. */
    staffId: v.optional(v.id("staff")),
    text: v.optional(v.string()),
    image: v.optional(
      v.object({
        storageId: v.id("_storage"),
        width: v.number(),
        height: v.number(),
      }),
    ),
  }).index("by_conversationId", ["conversationId"]),
});
