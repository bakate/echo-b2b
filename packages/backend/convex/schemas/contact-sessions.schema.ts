import { defineTable } from "convex/server";
import { v } from "convex/values";

export const contactSessionSchema = defineTable({
  name: v.string(),
  email: v.string(),
  organizationId: v.string(),
  expiresAt: v.number(),
  metadata: v.optional(
    v.object({
      userAgent: v.optional(v.string()),
      ip: v.optional(v.string()),
      language: v.optional(v.string()),
      languages: v.optional(v.string()),
      platform: v.optional(v.string()),
      vendor: v.optional(v.string()),
      screenResolution: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
      viewportSize: v.optional(v.string()),
      cookiesEnabled: v.optional(v.boolean()),
      referrer: v.optional(v.string()),
      currentUrl: v.optional(v.string()),
    })
  ),
})
  .index("by_expires_at", ["expiresAt"])
  .index("by_organization_id", ["organizationId"]);
