import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").collect();
  },
});

export const addUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("User is not authenticated");
    }
    return ctx.db.insert("users", {
      name: `User Bakate ${Math.ceil(Math.random() * 100).toFixed(2)}`,
    });
  },
});
