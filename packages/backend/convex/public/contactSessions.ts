import { v } from "convex/values";
import { mutation } from "../_generated/server";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export const createContactSession = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        ip: v.optional(v.string()),
        language: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        viewportSize: v.optional(v.string()),
        cookiesEnabled: v.optional(v.boolean()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
        languages: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const contactSessionId = ctx.db.insert("contactSessions", {
      name: args.name,
      email: args.email,
      organizationId: args.organizationId,
      expiresAt,
      metadata: args.metadata,
    });
    return contactSessionId;
  },
});

export const validateContactSession = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession) {
      return { valid: false, message: "Contact session not found" } as const;
    }
    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, message: "Contact session expired" } as const;
    }
    return { valid: true, contactSession } as const;
  },
});
