import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

// Helper function to make sure the user is authorized to access the conversations
export async function isAuthorized(ctx: QueryCtx | MutationCtx) {
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
