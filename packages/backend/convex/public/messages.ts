import { ConvexError, v } from "convex/values";

import { query, action } from "../_generated/server";

import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { saveMessage } from "@convex-dev/agent";

export const createMessage = action({
  args: {
    prompt: v.string(),
    contactSessionId: v.id("contactSessions"),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const { prompt, contactSessionId, threadId } = args;
    const contactSession = await ctx.runQuery(
      internal.system.internalQueries.contactSessions.getOneInternalQuery,
      { contactSessionId }
    );
    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });
    }
    if (contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Contact session expired",
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.internalQueries.conversations.getByThreadIdInternalQuery,
      { threadId }
    );
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    if (conversation.contactSessionId !== contactSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session",
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    // TODO: Implement subscription check
    if (conversation.status === "unresolved") {
      await supportAgent.generateText(
        ctx,
        {
          threadId,
        },
        {
          prompt,
          tools: {
            resolveConversation,
            escalateConversation,
          },
        }
      );
    } else {
      await saveMessage(ctx, components.agent, {
        threadId,
        prompt,
      });
    }
  },
});

export const getManyMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });
    }
    if (contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Contact session expired",
      });
    }
    if (contactSession._id !== args.contactSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session",
      });
    }

    const paginatedMessages = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginatedMessages;
  },
});
