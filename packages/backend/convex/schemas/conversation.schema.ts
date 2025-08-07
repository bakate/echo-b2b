import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conversationSchema = defineTable({
  threadId: v.string(),
  organizationId: v.string(),
  contactSessionId: v.id("contactSessions"),
  status: v.union(
    v.literal("unresolved"),
    v.literal("escalated"),
    v.literal("resolved")
  ),
})
  .index("by_thread_id", ["threadId"])
  .index("by_organization_id", ["organizationId"])
  .index("by_contact_session_id", ["contactSessionId"])
  .index("by_status_and_organization_id", ["status", "organizationId"]);
