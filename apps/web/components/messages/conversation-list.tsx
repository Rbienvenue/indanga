"use client";

import { MessageSquare, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConversationPreview } from "./types";

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  page,
  totalPages,
  onPageChange,
  loading,
}: {
  conversations: ConversationPreview[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Inbox</h2>
        <span className="text-xs text-muted-foreground">Booking & support</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            <MessageSquare className="mb-3 size-6" />
            Your conversations will appear here. Start from a booking or contact support.
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              aria-pressed={conversation.id === selectedId}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                conversation.id === selectedId && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  conversation.type === "SUPPORT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                {conversation.type === "SUPPORT" ? (
                  <ShieldCheck className="size-5" />
                ) : (
                  conversation.displayName.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{conversation.displayName}</span>
                  {conversation.unreadCount > 0 ? (
                    <Badge className="text-[10px]">{conversation.unreadCount} unread</Badge>
                  ) : null}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {conversation.lastMessage?.text ?? "Start the conversation"}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  {conversation.bookingReference ??
                    (conversation.type === "SUPPORT"
                      ? "INDANGA Support"
                      : conversation.propertyName)}{" "}
                  · {new Date(conversation.updatedAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
