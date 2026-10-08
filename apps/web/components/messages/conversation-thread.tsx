"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { messageSchema, type MessageValues } from "@/lib/validations/message";
import type { ChatMessage, Conversation } from "./types";

export function ConversationThread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const bottom = useRef<HTMLDivElement>(null);
  const lastMarked = useRef<string | null>(null);
  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "" },
  });
  const history = useInfiniteQuery({
    queryKey: ["messages", "history", conversation.id],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetcher<PaginationResponse<ChatMessage>>(
        `/messages/conversations/${conversation.id}/messages?page=${pageParam}&limit=30`,
      ),
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
  const read = useMutation({
    mutationFn: (messageId: string) =>
      fetcher(`/messages/conversations/${conversation.id}/read`, {
        method: "POST",
        body: JSON.stringify({ messageId }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    },
    onError: () => {
      lastMarked.current = null;
    },
  });
  const send = useMutation({
    mutationFn: (values: MessageValues) =>
      fetcher<ApiResponse<ChatMessage>>(`/messages/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["messages", "history", conversation.id] });
      void queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const latestId = history.data?.pages[0]?.data[0]?.id;
  const markRead = read.mutate;
  useEffect(() => {
    if (!latestId) return;
    bottom.current?.scrollIntoView({ block: "nearest" });
    function markVisibleRead() {
      if (document.visibilityState === "visible" && latestId && lastMarked.current !== latestId) {
        lastMarked.current = latestId;
        markRead(latestId);
      }
    }
    markVisibleRead();
    document.addEventListener("visibilitychange", markVisibleRead);
    return () => document.removeEventListener("visibilitychange", markVisibleRead);
  }, [latestId, markRead]);
  // New messages can shift page boundaries; deduplicate after refetching older pages.
  const messages = [
    ...new Map(
      history.data?.pages.flatMap((page) => page.data).map((message) => [message.id, message]),
    ).values(),
  ].reverse();

  return (
    <section className="flex min-h-0 flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-5 py-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Back to inbox"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{conversation.displayName}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.bookingReference ? `Booking ${conversation.bookingReference} · ` : ""}
            {conversation.propertyName ?? "INDANGA Support"}
          </p>
        </div>
      </header>
      <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-primary" />
        <p>
          <strong className="text-foreground">Stay safe on INDANGA.</strong> Never share passwords,
          one-time codes, or full card numbers in chat.
        </p>
      </div>
      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
        role="log"
        aria-label="Conversation messages"
      >
        {history.isPending ? (
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        ) : history.isError ? (
          <div role="alert">
            <p className="text-sm text-destructive">{history.error.message}</p>
            <Button variant="outline" size="sm" onClick={() => void history.refetch()}>
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Start the conversation. Your messages stay here so you can refer back to them.
          </p>
        ) : null}
        {history.hasNextPage ? (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={history.isFetchingNextPage}
              onClick={() => void history.fetchNextPage()}
            >
              {history.isFetchingNextPage ? "Loading…" : "Load older messages"}
            </Button>
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.isOwnMessage ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl border px-4 py-3 md:max-w-[75%]",
                message.isOwnMessage
                  ? "rounded-br-sm border-primary/15 bg-primary/5"
                  : "rounded-bl-sm bg-muted/40",
              )}
            >
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {message.sender.displayName}
              </p>
              <p className="whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
                {message.text}
              </p>
              <time
                dateTime={message.createdAt}
                className="mt-2 block text-right text-[10px] text-muted-foreground"
              >
                {new Date(message.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => send.mutate(values))}
          className="flex items-end gap-3 border-t p-4"
        >
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1">
                <FormLabel className="sr-only">Message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Write a message…"
                    maxLength={4000}
                    rows={2}
                    disabled={send.isPending}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing)
                        return;
                      event.preventDefault();
                      if (!event.repeat && !send.isPending && !history.isError)
                        event.currentTarget.form?.requestSubmit();
                    }}
                    className="min-h-16 resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={send.isPending || history.isError}
            aria-label="Send message"
          >
            <Send className="size-4" />
            <span className="hidden sm:inline">{send.isPending ? "Sending…" : "Send"}</span>
          </Button>
        </form>
      </Form>
    </section>
  );
}
