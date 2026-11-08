import pushNotifications from "@convex-dev/expo-push-notifications/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    // "true" makes the care team answer every patient message with a generic reply, for
    // testing push notifications. Set it on the dev deployment only.
    CHAT_AUTO_REPLY: v.optional(v.string()),
  },
});
// Sends Expo push notifications, batching and retrying them in the background.
app.use(pushNotifications, { env: {} });
// Limits how fast each patient can send chat messages.
app.use(rateLimiter);

export default app;
