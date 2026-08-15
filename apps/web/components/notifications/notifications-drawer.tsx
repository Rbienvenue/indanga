"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellRing,
  CheckCheck,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PaginationResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return formatDistanceToNow(date, { addSuffix: true });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "PAYMENT_COMPLETED":
    case "PAYMENT_PENDING":
      return CircleDollarSign;
    case "BOOKING_CONFIRMED":
    case "BOOKING_CREATED":
    case "BOOKING_REMINDER":
      return BellRing;
    case "SYSTEM":
      return Sparkles;
    default:
      return ShieldCheck;
  }
}

export function NotificationsDrawer() {
  const session = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocketIo();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useQuery<PaginationResponse<NotificationItem>>({
    queryKey: ["notifications"],
    queryFn: () => fetcher("/notifications?limit=5"),
    enabled: Boolean(user),
  });

  const unreadCountQuery = useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => fetcher("/notifications/unread-count"),
    enabled: Boolean(user),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => fetcher("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    function handleNotification(notification: NotificationItem) {
      toast.info(notification.title, {
        description: notification.message,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }

    socket.emit("subscribe:notifications", { userId: user.id });
    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [isConnected, queryClient, socket, user?.id]);

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = useMemo(
    () => unreadCountQuery.data?.count ?? notifications.filter((item) => !item.isRead).length,
    [notifications, unreadCountQuery.data?.count],
  );

  if (!user) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] leading-5 font-semibold text-primary-foreground ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-full sm:max-w-md">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DrawerTitle>Notifications</DrawerTitle>
              <DrawerDescription>
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void markAllAsReadMutation.mutateAsync()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="size-3.5" />
                  Mark read
                </Button>
              ) : null}
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close notifications"
                >
                  <X className="size-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <div className="space-y-4 p-4" aria-label="Loading notifications">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex gap-3">
                  <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </span>
              <p className="font-medium">Nothing new yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Booking and property updates will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex gap-3 border-b border-border px-4 py-4 transition-colors",
                    !notification.isRead && "bg-muted/30",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-1 flex-1 font-medium">{notification.title}</p>
                      {!notification.isRead ? (
                        <span
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DrawerFooter className="border-t border-border">
          <DrawerClose asChild>
            <Button asChild className="w-full">
              <Link href="/dashboard/notifications">View all notifications</Link>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
