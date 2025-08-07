"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { conversationIdAtom } from "../../atoms/widget-atoms";
import { organizationIdAtom } from "../../atoms/widget-atoms";
import { contactSessionIdAtomFamily } from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { screenAtom } from "../../atoms/widget-atoms";
import { useTransition } from "react";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DicebarAvatar } from "@workspace/ui/components/dicebar-avatar";
import { DEFAULT_PAGE_SIZE } from "../../constants";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});
type FormSchema = z.infer<typeof formSchema>;

export const WidgetChatScreen = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

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

  const messages = useThreadMessages(
    api.public.messages.getManyMessages,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: DEFAULT_PAGE_SIZE,
    }
  );

  const { canLoadMore, isLoadingMore, handleLoadMore, topElementRef } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: DEFAULT_PAGE_SIZE,
    });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessage = useAction(api.public.messages.createMessage);

  const handleSubmit = async (data: FormSchema) => {
    startTransition(() => {
      if (!conversation?.threadId || !contactSessionId) return;
      form.reset();
      createMessage({
        prompt: data.message,
        contactSessionId,
        threadId: conversation.threadId,
      });
    });
  };

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
      <AIConversation>
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? []).map((message) => (
            <AIMessage
              key={message.id}
              from={message.role === "user" ? "user" : "assistant"}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>

              {message.role === "assistant" ? (
                <DicebarAvatar
                  seed="assistant"
                  imageUrl="/logo.svg"
                  size={32}
                />
              ) : (
                <DicebarAvatar
                  seed="user"
                  size={32}
                  badgeImageUrl="/logo.svg"
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
      </AIConversation>
      {/* TODO: Add Suggestions */}
      <Form {...form}>
        <AIInput
          className="rounded-none border-x-0 border-b-0"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="message"
            disabled={isPending || conversation?.status === "resolved"}
            render={({ field }) => (
              <AIInputTextarea
                {...field}
                onChange={field.onChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    form.handleSubmit(handleSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "This conversation has been resolved"
                    : "Type your message..."
                }
                disabled={isPending || conversation?.status === "resolved"}
                value={field.value}
              />
            )}
          />

          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={
                isPending ||
                conversation?.status === "resolved" ||
                !form.formState.isValid
              }
              status={isPending ? "streaming" : "ready"}
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  );
};
