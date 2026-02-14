import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    body: v.string(),
    subtitle: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    status: v.optional(
      v.union(
        v.literal("published"),
        v.literal("hidden"),
        v.literal("flagged")
      )
    ),
    contentHtml: v.optional(v.string()),
    topic: v.union(
      v.literal("Web Development"),
      v.literal("Design & UI"),
      v.literal("AI"),
      v.literal("Engineering")
    ),
  })
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_body", { searchField: "body" }),

  presences: defineTable({
    userId: v.string(),
    roomId: v.string(),
    sessionId: v.string(),
  }),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    authorName: v.string(),
    body: v.string(),
    status: v.optional(v.union(v.literal("visible"), v.literal("hidden"))),
  }),

  rateLimits: defineTable({
    userId: v.string(),
    lastPostTime: v.optional(v.number()),
    lastCommentTime: v.optional(v.number()),
    dailyPostCount: v.optional(v.number()),
    hourlyCommentCount: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  passwordResetOtps: defineTable({
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
  }).index("by_email", ["email"]),

  newsletterSubscriptions: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});