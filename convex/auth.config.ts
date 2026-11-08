import { env } from "./_generated/server";

// Tells Convex to trust the tokens Convex Auth issues from this deployment.
export default {
  providers: [
    {
      domain: env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
