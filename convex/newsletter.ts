import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const existing = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Already subscribed; no-op for idempotency.
      return { success: true, alreadySubscribed: true };
    }

    await ctx.db.insert("newsletterSubscriptions", {
      email,
      createdAt: Date.now(),
    });

    // Note: Actual email sending is handled by a separate emails mutation.
    return { success: true, alreadySubscribed: false };
  },
});

