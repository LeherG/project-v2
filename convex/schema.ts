//WORKS!!!!!!

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  posts: defineTable({
    title: v.string(),
    body: v.string(),
    author: v.id("users"),
  }),

  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("mentor"), v.literal("mentee"), v.literal("both")),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  connectionRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    message: v.optional(v.string()),
  })
    .index("by_to_user", ["toUserId", "status"])
    .index("by_from_user", ["fromUserId", "status"])
    .index("by_users", ["fromUserId", "toUserId"]),

  connections: defineTable({
    mentorId: v.id("users"),
    menteeId: v.id("users"),
    requestId: v.id("connectionRequests"),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_mentee", ["menteeId"]),

  comments: defineTable({
    postId: v.id("posts"),       // link to the post
    author: v.id("users"),       // link to the user
    body: v.string(),            // the comment text
  })
    .index("by_post", ["postId"]) // so we can query comments by post
    .index("by_author", ["author"]), // optional if you want to query user comments

});


