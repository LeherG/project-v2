import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create or update user profile
export const upsertProfile = mutation({
  args: {
    role: v.union(v.literal("mentor"), v.literal("mentee"), v.literal("both")),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("profiles", { userId, ...args });
    }
  },
});

// Get current user's profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Browse available mentors or mentees
export const browseUsers = query({
  args: {
    lookingFor: v.union(v.literal("mentors"), v.literal("mentees")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const targetRole = args.lookingFor === "mentors" ? "mentor" : "mentee";
    
    const profiles = await ctx.db.query("profiles").collect();
    
    // Filter for users with the target role and exclude current user
    const filtered = profiles.filter(
      (p) => p.userId !== userId && 
      (p.role === targetRole || p.role === "both")
    );

    // Get user details
    const usersWithDetails = await Promise.all(
      filtered.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          profileId: profile._id,
          userId: profile.userId,
          email: user?.email,
          role: profile.role,
          bio: profile.bio,
          skills: profile.skills,
          interests: profile.interests,
        };
      })
    );

    return usersWithDetails;
  },
});

// Send connection request
export const sendConnectionRequest = mutation({
  args: {
    toUserId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) throw new Error("Not authenticated");

    // Check if request already exists
    const existing = await ctx.db
      .query("connectionRequests")
      .withIndex("by_users", (q) =>
        q.eq("fromUserId", fromUserId).eq("toUserId", args.toUserId)
      )
      .first();

    if (existing) {
      throw new Error("Connection request already exists");
    }

    const requestId = await ctx.db.insert("connectionRequests", {
      fromUserId,
      toUserId: args.toUserId,
      status: "pending",
      message: args.message,
    });

    return requestId;
  },
});

// Get pending requests (received)
export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("connectionRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("status", "pending"))
      .collect();

    // Get sender details
    const requestsWithDetails = await Promise.all(
      requests.map(async (req) => {
        const fromUser = await ctx.db.get(req.fromUserId);
        const fromProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", req.fromUserId))
          .first();

        return {
          requestId: req._id,
          fromUserId: req.fromUserId,
          fromEmail: fromUser?.email,
          fromRole: fromProfile?.role,
          fromBio: fromProfile?.bio,
          message: req.message,
          createdAt: req._creationTime,
        };
      })
    );

    return requestsWithDetails;
  },
});

// Accept or reject connection request
export const respondToRequest = mutation({
  args: {
    requestId: v.id("connectionRequests"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.toUserId !== userId) throw new Error("Unauthorized");

    if (args.accept) {
      // Update request status
      await ctx.db.patch(args.requestId, { status: "accepted" });

      // Determine who is mentor and who is mentee
      const fromProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", request.fromUserId))
        .first();
      // const toProfile = await ctx.db
      //   .query("profiles")
      //   .withIndex("by_user", (q) => q.eq("userId", request.toUserId))
      //   .first();

      // console.log(toProfile);
      let mentorId: Id<"users">;
      let menteeId: Id<"users">;

      if (fromProfile?.role === "mentor" || fromProfile?.role === "both") {
        mentorId = request.fromUserId;
        menteeId = request.toUserId;
      } else {
        mentorId = request.toUserId;
        menteeId = request.fromUserId;
      }

      // Create connection
      await ctx.db.insert("connections", {
        mentorId,
        menteeId,
        requestId: args.requestId,
      });
    } else {
      await ctx.db.patch(args.requestId, { status: "rejected" });
    }
  },
});

// Get my connections
export const getMyConnections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { mentors: [], mentees: [] };

    // Get connections where I'm the mentee
    const asMentee = await ctx.db
      .query("connections")
      .withIndex("by_mentee", (q) => q.eq("menteeId", userId))
      .collect();

    // Get connections where I'm the mentor
    const asMentor = await ctx.db
      .query("connections")
      .withIndex("by_mentor", (q) => q.eq("mentorId", userId))
      .collect();

    const mentors = await Promise.all(
      asMentee.map(async (conn) => {
        const user = await ctx.db.get(conn.mentorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", conn.mentorId))
          .first();
        return {
          connectionId: conn._id,
          userId: conn.mentorId,
          email: user?.email,
          bio: profile?.bio,
          skills: profile?.skills,
        };
      })
    );

    const mentees = await Promise.all(
      asMentor.map(async (conn) => {
        const user = await ctx.db.get(conn.menteeId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", conn.menteeId))
          .first();
        return {
          connectionId: conn._id,
          userId: conn.menteeId,
          email: user?.email,
          bio: profile?.bio,
          interests: profile?.interests,
        };
      })
    );

    return { mentors, mentees };
  },
});