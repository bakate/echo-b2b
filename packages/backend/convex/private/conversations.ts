import { ConvexError, v } from "convex/values";

import { mutation, MutationCtx, QueryCtx, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator, PaginationResult } from "convex/server";

// Helper function to make sure the user is authorized to access the conversations
async function isAuthorized(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource",
    });
  }
  if (!identity.orgId || typeof identity.orgId !== "string") {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found",
    });
  }

  return identity;
}

// export const getConversation = query({
//   args: {
//     conversationId: v.id("conversations"),
//     contactSessionId: v.id("contactSessions"),
//   },
//   handler: async (ctx, args) => {
//     const contactSessionId = await validateSession(ctx, {
//       contactSessionId: args.contactSessionId,
//     });
//     const conversation = await ctx.db.get(args.conversationId);
//     if (!conversation) {
//       throw new ConvexError({
//         code: "NOT_FOUND",
//         message: "Conversation not found",
//       });
//     }

//     if (conversation.contactSessionId !== contactSessionId) {
//       throw new ConvexError({
//         code: "UNAUTHORIZED",
//         message: "Incorrect session",
//       });
//     }
//     return {
//       _id: conversation._id,
//       threadId: conversation.threadId,
//       status: conversation.status,
//     } as const;
//   },
// });

export type ConversationStatus = Doc<"conversations">["status"];

export const getManyConversations = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await isAuthorized(ctx);

    let conversations: PaginationResult<Doc<"conversations">>;

    if (args.status) {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q
            .eq("status", args.status as ConversationStatus)
            .eq("organizationId", identity.orgId as string)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", identity.orgId as string)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }
    const conversationsWithAdditionalData = await Promise.all(
      conversations.page.map(async (conversation) => {
        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });
        const contactSession = await ctx.db.get(conversation.contactSessionId);
        if (!contactSession) {
          return null;
        }
        return {
          ...conversation,
          lastMessage: messages.page[0] ?? null,
          contactSession,
        };
      })
    );

    const validConversations = conversationsWithAdditionalData.filter(
      (conversation): conversation is NonNullable<typeof conversation> =>
        conversation !== null
    );
    return {
      ...conversations,
      page: validConversations,
    };
  },
});
