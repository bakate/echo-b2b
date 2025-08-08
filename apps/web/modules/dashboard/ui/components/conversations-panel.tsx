"use client";

import { api } from "@workspace/backend/_generated/api";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { usePaginatedQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  ListIcon,
} from "lucide-react";
import { DicebarAvatar } from "@workspace/ui/components/dicebar-avatar";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { getCountryFlag, getCountryFromTimezone } from "@/lib/country-utils";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { statusFilterAtom } from "../../atoms";
import { ConversationStatus } from "@workspace/backend/private/conversations";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { DEFAULT_PAGE_SIZE } from "../../constants";

export const ConversationsPanel = () => {
  const pathname = usePathname();
  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);

  const conversations = usePaginatedQuery(
    api.private.conversations.getManyConversations,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: DEFAULT_PAGE_SIZE,
    }
  );

  const {
    canLoadMore,
    isLoadingMore,
    handleLoadMore,
    topElementRef,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: DEFAULT_PAGE_SIZE,
  });

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) =>
            setStatusFilter(value as ConversationStatus | "all")
          }
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <SkeletonConversations />
      ) : (
        <ScrollArea className="max-h-[calc(100dvh-53px)]">
          <div className="flex w-full flex-1 flex-col text-sm">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role === "user";
              const country = getCountryFromTimezone(
                conversation.contactSession?.metadata?.timezone || ""
              );

              const countryFlag = country?.code
                ? getCountryFlag(country.code)
                : undefined;
              return (
                <Link
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                  className={cn(
                    "relative cursor-pointer flex items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity"
                    )}
                  />
                  <DicebarAvatar
                    seed={conversation.contactSession._id}
                    size={40}
                    badgeImageUrl={countryFlag}
                  />
                  <div className="flex-1">
                    <div className="flex items-center w-full gap-2">
                      <span className="font-bold truncate">
                        {conversation.contactSession.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                        {formatDistanceToNow(conversation._creationTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator ? (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        ) : null}

                        <span
                          className={cn(
                            "line-clamp-1 text-muted-foreground text-xs",
                            !isLastMessageFromOperator
                              ? "text-font-bold text-black"
                              : ""
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>

                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export const SkeletonConversations = () => {
  return (
    <div className="flex h-full w-full flex-col gap-2 min-h-0 flex-1">
      <div className="flex w-full min-w-0 flex-col p-2 relative">
        <div className="w-full space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="flex items-start gap-3 rounded-lg p-4" key={index}>
              <Skeleton key={index} className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center w-full gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12 ml-auto shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
