import { internalQuery } from "../../_generated/server";
import { ConvexError, v } from "convex/values";

export const getOneInternalQuery = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});
