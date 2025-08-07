import { ConvexError, v } from "convex/values";

import { mutation, MutationCtx, QueryCtx, query } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { env } from "../../env";
import { Id } from "../_generated/dataModel";

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
    // TODO: Replace once functionality for thread creation is present
    const threadId = "1234";

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
      return null;
    }
    return {
      _id: conversation._id,
      threadId: conversation.threadId,
      status: conversation.status,
    } as const;
  },
});
