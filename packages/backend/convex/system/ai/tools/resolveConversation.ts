import { createTool } from "@convex-dev/agent";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const resolveConversation = createTool({
  description: "Resolve a conversation",
  args: z.object({}),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Thread ID is required",
      });
    }

    await ctx.runMutation(
      internal.system.internalQueries.conversations
        .resolveConversationInternalQuery,
      {
        threadId: ctx.threadId,
      }
    );

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        content: "Conversation resolved",
        role: "assistant",
      },
    });
    return "Conversation resolved";
  },
});
