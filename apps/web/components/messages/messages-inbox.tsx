"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSession } from "@/components/providers/session-provider";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { MessageButton } from "./message-button";
import type { Conversation, ConversationPreview } from "./types";

export function MessagesInbox() {
  const session = useSession();
  const [selectedId, setSelectedId] = useQueryState("conversation");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocketIo(Boolean(session));
  const inbox = useQuery({
    queryKey: ["messages", "conversations", session?.user.id, page],
    enabled: Boolean(session),
    queryFn: () =>
      fetcher<PaginationResponse<ConversationPreview>>(
        `/messages/conversations?page=${page}&limit=20`,
      ),
  });
  const detail = useQuery({
    queryKey: ["messages", "conversation", selectedId],
    enabled: Boolean(selectedId && session),
    queryFn: () => fetcher<ApiResponse<Conversation>>(`/messages/conversations/${selectedId}`),
  });
  useEffect(() => {
    if (!socket || !isConnected) return;
    if (selectedId) socket.emit("subscribe:conversation", { conversationId: selectedId });
    // Reconcile anything missed while disconnected.
    void queryClient.invalidateQueries({ queryKey: ["messages"] });
    return () => {
      if (selectedId) socket.emit("unsubscribe:conversation", { conversationId: selectedId });
    };
  }, [socket, isConnected, selectedId, queryClient]);

  if (!session)
    return <p className="text-sm text-muted-foreground">Sign in to access your messages.</p>;
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title={session.user.role === "admin" ? "Support inbox" : "Messages"}
        description="Keep booking conversations and support together on INDANGA."
        actions={session.user.role !== "admin" ? <MessageButton /> : undefined}
      />
      {inbox.isError ? (
        <div role="alert" className="flex items-center gap-3 rounded-lg border p-4 text-sm">
          <p className="text-destructive">{inbox.error.message}</p>
          <Button variant="outline" size="sm" onClick={() => void inbox.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      <div className="grid h-[min(720px,calc(100dvh-230px))] min-h-[440px] overflow-hidden rounded-xl border bg-background shadow-sm md:grid-cols-[300px_minmax(0,1fr)]">
        <div className={cn("min-h-0 [&>aside]:h-full", selectedId && "hidden md:block")}>
          <ConversationList
            conversations={inbox.data?.data ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
            page={page}
            totalPages={inbox.data?.meta.totalPages ?? 0}
            onPageChange={setPage}
            loading={inbox.isPending}
          />
        </div>
        <div className={cn("min-h-0 [&>section]:h-full", !selectedId && "hidden md:block")}>
          {selectedId ? (
            detail.isPending ? (
              <p className="p-6 text-sm text-muted-foreground">Loading conversation…</p>
            ) : detail.isError ? (
              <div className="space-y-3 p-6" role="alert">
                <p className="text-sm text-destructive">{detail.error.message}</p>
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Back to inbox
                </Button>
                <Button variant="outline" onClick={() => void detail.refetch()}>
                  Retry
                </Button>
              </div>
            ) : detail.data ? (
              <ConversationThread
                key={selectedId}
                conversation={detail.data.data}
                onBack={() => setSelectedId(null)}
              />
            ) : null
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <MessageSquare className="size-10 text-primary/40" />
              <h2 className="font-semibold">Your conversations, in one place</h2>
              <p className="max-w-xs text-sm text-muted-foreground">
                Choose a conversation to view messages and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
