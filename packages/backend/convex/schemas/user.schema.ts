import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userSchema = defineTable({
  name: v.string(),
});
