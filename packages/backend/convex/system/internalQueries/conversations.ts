import { internalMutation, internalQuery } from "../../_generated/server";
import { ConvexError, v } from "convex/values";

export const getByThreadIdInternalQuery = internalQuery({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    return conversation;
  },
});

export const resolveConversationInternalQuery = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation already resolved",
      });
    }
    await ctx.db.patch(conversation._id, {
      status: "resolved",
    });
  },
});

export const escalateConversationInternalQuery = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    if (conversation.status === "escalated") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation already escalated",
      });
    }
    await ctx.db.patch(conversation._id, {
      status: "escalated",
    });
  },
});
