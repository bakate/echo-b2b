import { createTool } from "@convex-dev/agent";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const escalateConversation = createTool({
  description: "Escalate a conversation",
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
        .escalateConversationInternalQuery,
      {
        threadId: ctx.threadId,
      }
    );

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        content: "Conversation escalated to a human operator",
        role: "assistant",
      },
    });
    return "Conversation escalated";
  },
});
