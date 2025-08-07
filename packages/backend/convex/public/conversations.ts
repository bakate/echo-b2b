import { ConvexError, v } from "convex/values";

import { mutation, MutationCtx, QueryCtx, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";

// session validator
async function validateSession(
  ctx: MutationCtx | QueryCtx,
  args: { contactSessionId: Id<"contactSessions"> }
) {
  const session = await ctx.db.get(args.contactSessionId);
  if (!session || session.expiresAt < Date.now()) {
    {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }
  }
  return session._id;
}

export const createConversation = mutation({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const { organizationId, contactSessionId } = args;

    const sessionId = await validateSession(ctx, { contactSessionId });

    const { threadId } = await supportAgent.createThread(ctx, {
      userId: organizationId,
    });

    await saveMessage(ctx, components.agent, {
      threadId,

      message: {
        role: "assistant",
        // TODO: later modify to widget settings' initial message
        content: "Hello, how can I help you today?",
      },
    });

    const conversationId = await ctx.db.insert("conversations", {
      threadId,
      organizationId,
      contactSessionId: sessionId,
      status: "unresolved",
    });
    return conversationId;
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSessionId = await validateSession(ctx, {
      contactSessionId: args.contactSessionId,
    });
    const conversation = await ctx.db.get(args.conversationId);
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
    return {
      _id: conversation._id,
      threadId: conversation.threadId,
      status: conversation.status,
    } as const;
  },
});

export const getManyConversations = query({
  args: {
    contactSessionId: v.id("contactSessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const contactSessionId = await validateSession(ctx, {
      contactSessionId: args.contactSessionId,
    });
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_contact_session_id", (q) =>
        q.eq("contactSessionId", contactSessionId)
      )
      .paginate(args.paginationOpts);

    // we need to enrich the response with the last message
    const conversationsWithLastMessage = await Promise.all(
      conversations.page.map(async (conversation) => {
        let lastMessage: MessageDoc | null = null;

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });

        if (messages.page.length > 0) {
          lastMessage = messages.page[0] ?? null;
        }

        return {
          _id: conversation._id,
          threadId: conversation.threadId,
          status: conversation.status,
          _creationTime: conversation._creationTime,
          organizationId: conversation.organizationId,
          lastMessage,
        };
      })
    );

    return {
      ...conversations,
      page: conversationsWithLastMessage,
    };
  },
});
