import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";

const isAdmin = (userId: string) => userId === ADMIN_USER_ID;

export const getCommentsByPostId = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();

    return data;
  },
});

export const getVisibleCommentsByPostId = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("comments")
      .filter((q) => 
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("status"), "visible")
        )
      )
      .order("desc")
      .collect();

    return data;
  },
});

export const createComment = mutation({
  args: {
    body: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    // Check rate limit
    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    const COMMENT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
    const COMMENT_RATE_LIMIT = 3; // per day

    if (rateLimit) {
      const timeSinceLastComment = now - (rateLimit.lastCommentTime || 0);
      const dailyCount = timeSinceLastComment > COMMENT_COOLDOWN_MS ? 0 : rateLimit.dailyCommentCount || 0;

      if (dailyCount >= COMMENT_RATE_LIMIT) {
        throw new ConvexError(
          `Rate limit exceeded. You can post ${COMMENT_RATE_LIMIT} comments per day.`
        );
      }

      await ctx.db.patch(rateLimit._id, {
        lastCommentTime: now,
        dailyCommentCount: dailyCount + 1,
      });
    } else {
      await ctx.db.insert("rateLimits", {
        userId: user._id,
        lastCommentTime: now,
        dailyCommentCount: 1,
      });
    }

    return await ctx.db.insert("comments", {
      postId: args.postId,
      body: args.body,
      authorId: user._id,
      authorName: user.name,
      status: "visible",
    });
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    if (comment.authorId !== user._id && !isAdmin(user._id)) {
      throw new ConvexError("Not authorized to edit this comment");
    }

    await ctx.db.patch(args.commentId, { body: args.body });
    return args.commentId;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    if (comment.authorId !== user._id && !isAdmin(user._id)) {
      throw new ConvexError("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
    return args.commentId;
  },
});
