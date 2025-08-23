"use client";
import {
  ConversationId,
  SingleConversation,
  SingleConversationSchema,
} from "@/modules/dashboard/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { DicebarAvatar } from "@workspace/ui/components/dicebar-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Wand2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

// AI Elements
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { DEFAULT_PAGE_SIZE } from "../../constants";
// End AI Elements

type Props = {
  conversationId: ConversationId;
};
export const SingleConversationScreen = ({ conversationId }: Props) => {
  const conversation = useQuery(api.private.conversations.getOneConversation, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getManyMessages,
    conversation?.threadId
      ? {
          threadId: conversation.threadId,
        }
      : "skip",
    {
      initialNumItems: DEFAULT_PAGE_SIZE,
    }
  );
  const createMessage = useMutation(api.private.messages.createMessage);
  const {
    canLoadMore,
    isLoadingMore,
    handleLoadMore,
    topElementRef,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: DEFAULT_PAGE_SIZE,
  });

  const form = useForm<SingleConversation>({
    resolver: zodResolver(SingleConversationSchema),
    defaultValues: {
      message: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const handleSubmit = (data: SingleConversation) => {
    startTransition(async () => {
      try {
        await createMessage({
          prompt: data.message,
          conversationId,
        });
        form.reset();
      } catch (error) {
        console.log(error);
      }
    });
  };

  if (!conversation || isLoadingFirstPage) {
    return <SingleConversationSkeleton />;
  }
  return (
    <div className="flex flex-col bg-muted h-full">
      <header className="flex.items-center.justify-between.border-b.bg-background.p-2.5">
        <Button size={"icon"} variant={"ghost"} onClick={() => {}}>
          <MoreHorizontal />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100%-180px)]">
        <AIConversationContent>
          {toUIMessages(messages.results ?? []).map((message) => (
            <AIMessage
              key={message.id}
              from={message.role === "user" ? "assistant" : "user"}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>

              {message.role === "user" ? (
                <DicebarAvatar
                  seed={conversation?.contactSessionId ?? "user"}
                  size={32}
                />
              ) : null}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
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
                      : "Type your response as an operator..."
                  }
                  disabled={isPending || conversation?.status === "resolved"}
                  value={field.value}
                />
              )}
            />

            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton>
                  <Wand2Icon />
                  Enhance
                </AIInputButton>
              </AIInputTools>
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
      </div>
      <InfiniteScrollTrigger
        canLoadMore={canLoadMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        ref={topElementRef}
      />
    </div>
  );
};

const SingleConversationSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i}>
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
};
