import { v } from "convex/values";

import { mutation, action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { env } from "../../env";

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
});
export const validateOrganization = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const organization = await clerkClient.organizations.getOrganization({
        organizationId: args.organizationId,
      });

      if (!organization) {
        return { valid: false, message: "Organization not found" } as const;
      }
      return {
        valid: true,
        organizationId: organization.id,
        organizationName: organization.name,
      } as const;
    } catch (error) {
      return { valid: false, message: "Organization not found" } as const;
    }
  },
});
