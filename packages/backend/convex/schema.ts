import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userSchema } from "./schemas/user.schema";
import { contactSessionSchema } from "./schemas/contact-sessions.schema";
import { conversationSchema } from "./schemas/conversation.schema";

const schema = defineSchema({
  users: userSchema,
  contactSessions: contactSessionSchema,
  conversations: conversationSchema,
});

export default schema;
