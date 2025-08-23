import { Id } from "@workspace/backend/_generated/dataModel";
import { z } from "zod";

export type ConversationId = Id<"conversations">;

export const SingleConversationSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type SingleConversation = z.infer<typeof SingleConversationSchema>;
