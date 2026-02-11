import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { GenericActionCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";

const POST_RATE_LIMIT = 3; // posts per day
const COMMENT_RATE_LIMIT = 20; // comments per hour
const POST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const COMMENT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export const checkPostRateLimit = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (!rateLimit) {
      // First time user
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        lastPostTime: now,
        dailyPostCount: 1,
      });
      return { allowed: true, remaining: POST_RATE_LIMIT - 1 };
    }

    // Check if 24 hours have passed
    const timeSinceLastPost = now - (rateLimit.lastPostTime || 0);

    if (timeSinceLastPost > POST_COOLDOWN_MS) {
      // Reset daily counter
      await ctx.db.patch(rateLimit._id, {
        lastPostTime: now,
        dailyPostCount: 1,
      });
      return { allowed: true, remaining: POST_RATE_LIMIT - 1 };
    }

    // Within 24 hours - check counter
    const dailyCount = rateLimit.dailyPostCount || 0;

    if (dailyCount >= POST_RATE_LIMIT) {
      const timeUntilReset = POST_COOLDOWN_MS - timeSinceLastPost;
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil(timeUntilReset / 1000 / 60), // minutes
      };
    }

    // Increment counter
    await ctx.db.patch(rateLimit._id, {
      dailyPostCount: dailyCount + 1,
    });

    return { allowed: true, remaining: POST_RATE_LIMIT - dailyCount - 1 };
  },
});

export const checkCommentRateLimit = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (!rateLimit) {
      // First time user
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        lastCommentTime: now,
        hourlyCommentCount: 1,
      });
      return { allowed: true, remaining: COMMENT_RATE_LIMIT - 1 };
    }

    // Check if 1 hour has passed
    const timeSinceLastComment = now - (rateLimit.lastCommentTime || 0);

    if (timeSinceLastComment > COMMENT_COOLDOWN_MS) {
      // Reset hourly counter
      await ctx.db.patch(rateLimit._id, {
        lastCommentTime: now,
        hourlyCommentCount: 1,
      });
      return { allowed: true, remaining: COMMENT_RATE_LIMIT - 1 };
    }

    // Within 1 hour - check counter
    const hourlyCount = rateLimit.hourlyCommentCount || 0;

    if (hourlyCount >= COMMENT_RATE_LIMIT) {
      const timeUntilReset = COMMENT_COOLDOWN_MS - timeSinceLastComment;
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil(timeUntilReset / 1000 / 60), // minutes
      };
    }

    // Increment counter
    await ctx.db.patch(rateLimit._id, {
      hourlyCommentCount: hourlyCount + 1,
    });

    return { allowed: true, remaining: COMMENT_RATE_LIMIT - hourlyCount - 1 };
  },
});

export const getRateLimitStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!rateLimit) {
      return {
        postsRemaining: POST_RATE_LIMIT,
        commentsRemaining: COMMENT_RATE_LIMIT,
      };
    }

    const now = Date.now();
    const timeSinceLastPost = now - (rateLimit.lastPostTime || 0);
    const timeSinceLastComment = now - (rateLimit.lastCommentTime || 0);

    const dailyCount =
      timeSinceLastPost > POST_COOLDOWN_MS ? 0 : rateLimit.dailyPostCount || 0;
    const hourlyCount =
      timeSinceLastComment > COMMENT_COOLDOWN_MS
        ? 0
        : rateLimit.hourlyCommentCount || 0;

    return {
      postsRemaining: Math.max(0, POST_RATE_LIMIT - dailyCount),
      commentsRemaining: Math.max(0, COMMENT_RATE_LIMIT - hourlyCount),
      nextPostTime:
        dailyCount >= POST_RATE_LIMIT
          ? (rateLimit.lastPostTime || 0) + POST_COOLDOWN_MS
          : null,
      nextCommentTime:
        hourlyCount >= COMMENT_RATE_LIMIT
          ? (rateLimit.lastCommentTime || 0) + COMMENT_COOLDOWN_MS
          : null,
    };
  },
});
