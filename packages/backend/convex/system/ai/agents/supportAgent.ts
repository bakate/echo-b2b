import { openai } from "@ai-sdk/openai";

import { Agent } from "@convex-dev/agent";

import { components } from "../../../_generated/api";

export const supportAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o-mini"),
  instructions: `You are a customer support agent. You are here to help customers with their queries.
    
    You have the following tools:
    - resolveConversation: Resolve a conversation when user is satisfied with the response
    - escalateConversation: Escalate a conversation when user expresses frustration or requests a human explicitly`,
});
