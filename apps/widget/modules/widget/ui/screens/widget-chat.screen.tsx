"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { conversationIdAtom } from "../../atoms/widget-atoms";
import { organizationIdAtom } from "../../atoms/widget-atoms";
import { errorMessageAtom } from "../../atoms/widget-atoms";
import { contactSessionIdAtomFamily } from "../../atoms/widget-atoms";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { screenAtom } from "../../atoms/widget-atoms";
import { useTransition } from "react";

export const WidgetChatScreen = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const setErrorMessage = useSetAtom(errorMessageAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversation = useQuery(
    api.public.conversations.getConversation,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : "skip"
  );

  const handleBack = () => {
    setScreen("selection");
    setConversationId(null);
  };

  const [isPending, startTransition] = useTransition();
  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button variant="transparent" size="icon" onClick={handleBack}>
            <ArrowLeftIcon />
          </Button>
          <p className="text-lg">Chat</p>
        </div>
        <Button variant="transparent" size="icon">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 p-4 ">
        <p className="text-sm">{JSON.stringify(conversation)}</p>
      </div>
    </>
  );
};
