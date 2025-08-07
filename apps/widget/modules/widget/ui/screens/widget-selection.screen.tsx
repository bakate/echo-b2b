"use client";

import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useSetAtom } from "jotai";
import { screenAtom } from "../../atoms/widget-atoms";
import { useAtomValue } from "jotai";
import { organizationIdAtom } from "../../atoms/widget-atoms";
import { contactSessionIdAtomFamily } from "../../atoms/widget-atoms";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { errorMessageAtom } from "../../atoms/widget-atoms";
import { useTransition } from "react";
import { Loader } from "lucide-react";
import { conversationIdAtom } from "../../atoms/widget-atoms";
import { WidgetFooter } from "../components/widget-footer";

export const WidgetSelectionScreen = () => {
  const [isPending, startTransition] = useTransition();

  const setScreen = useSetAtom(screenAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const setConversationId = useSetAtom(conversationIdAtom);
  const createConversationMutation = useMutation(
    api.public.conversations.createConversation
  );

  const handleNewConversation = () => {
    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }
    if (!contactSessionId) {
      setScreen("auth");
      return;
    }
    try {
      startTransition(async () => {
        const conversationId = await createConversationMutation({
          organizationId,
          contactSessionId,
        });
        setConversationId(conversationId);
        setScreen("chat");
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to create conversation");
      setScreen("auth");
    }
  };
  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋🏽👋🏽</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col  gap-y-4 p-4 overflow-y-auto">
        <Button
          className="h-16 w-full justify-between"
          variant={"outline"}
          onClick={handleNewConversation}
          disabled={isPending}
        >
          {isPending ? (
            <Loader className="animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-x-2">
                <MessageSquareTextIcon className="size-4" />
                <span>Start Chat</span>
              </div>
              <ChevronRightIcon className="size-4" />
            </>
          )}
        </Button>
      </div>

      <WidgetFooter />
    </>
  );
};
