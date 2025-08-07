import { internalQuery } from "../../_generated/server";
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
