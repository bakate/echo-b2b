import { atomWithStorage } from "jotai/utils";
import { STATUS_FILTER_KEY } from "./constants";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { ConversationStatus } from "@workspace/backend/private/conversations";

export const statusFilterAtom = atomWithStorage<ConversationStatus | "all">(
  STATUS_FILTER_KEY,
  "all"
);
