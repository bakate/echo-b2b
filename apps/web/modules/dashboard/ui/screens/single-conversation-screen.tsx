"use client";
import {
  ConversationId,
  ConversationStatus,
  SingleConversation,
  SingleConversationSchema,
} from "@/modules/dashboard/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { DicebarAvatar } from "@workspace/ui/components/dicebar-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2Icon, MoreHorizontal, Wand2Icon } from "lucide-react";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { ConversationStatusButton } from "../components/conversation-satus-button";
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

  const updateStatus = useMutation(api.private.conversations.updateStatus);

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
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

  const handleToggleStatus = () => {
    startTransition(async () => {
      if (!conversation) {
        return;
      }
      let newStatus: ConversationStatus;
      if (conversation.status === "unresolved") {
        newStatus = "escalated";
      } else if (conversation.status === "escalated") {
        newStatus = "resolved";
      } else {
        newStatus = "unresolved";
      }
      try {
        await updateStatus({
          conversationId,
          status: newStatus,
        });
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleEnhanceResponse = () => {
    startTransition(async () => {
      if (!conversation) {
        return;
      }
      try {
        const response = await enhanceResponse({
          prompt: form.getValues("message"),
        });
        form.setValue("message", response);
      } catch (error) {
        console.log(error);
      }
    });
  };

  if (conversation === undefined || isLoadingFirstPage || isLoadingMore) {
    return <SingleConversationSkeleton />;
  }
  return (
    <div className="flex flex-col bg-muted h-full">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size={"icon"} variant={"ghost"} onClick={() => {}}>
          <MoreHorizontal />
        </Button>
        <ConversationStatusButton
          status={conversation.status}
          onClick={handleToggleStatus}
          disabled={isPending}
        />
      </header>
      <AIConversation className="max-h-[calc(100dvh-180px)]">
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
                <AIInputButton
                  disabled={
                    isPending ||
                    conversation?.status === "resolved" ||
                    !form.formState.isValid
                  }
                  onClick={handleEnhanceResponse}
                >
                  {isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <Wand2Icon />
                  )}
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
    </div>
  );
};

const SingleConversationSkeleton = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size={"icon"} variant={"ghost"} onClick={() => {}}>
          <MoreHorizontal />
        </Button>
        <ConversationStatusButton
          status={"unresolved"}
          onClick={() => {}}
          disabled={true}
        />
      </div>
      <AIConversation className="max-h-[calc(100dvh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 10 }, (_, i) => {
            const isUser = i % 2 === 0;
            const widths = ["w-48", "w-60", "w-72", "w-20"];
            const width = widths[i % widths.length];
            return (
              <div
                key={i}
                className={cn(
                  "flex w-full items-end justify-end gap-2 py-2 [&_div]:max-w-[80%]",
                  isUser
                    ? "is-user"
                    : "is-assistant flex-row-reverse justify-end"
                )}
              >
                <Skeleton className={`h-10 ${width}`} />
                <Skeleton className="size-10 rounded-full bg-neutral-200" />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            disabled
            placeholder="type your response as an operator..."
          />
          <AIInputToolbar>
            <AIInputTools>
              <AIInputButton disabled>
                <Wand2Icon />
              </AIInputButton>
            </AIInputTools>
            <AIInputSubmit status="ready" />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};
