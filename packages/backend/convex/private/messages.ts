import { ConvexError, v } from "convex/values";

import {
  mutation,
  MutationCtx,
  QueryCtx,
  query,
  action,
} from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { isAuthorized } from "./shared";
import { saveMessage } from "@convex-dev/agent";

// we are responding as an operator to a conversation so it's a mutation
export const createMessage = mutation({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { prompt, conversationId } = args;
    const identity = await isAuthorized(ctx);

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    if (conversation.organizationId !== identity.orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: identity.familyName,
      message: {
        content: prompt,
        role: "assistant",
      },
    });
  },
});

export const getManyMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await isAuthorized(ctx);
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
    if (conversation.organizationId !== identity.orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    return await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
  },
});
