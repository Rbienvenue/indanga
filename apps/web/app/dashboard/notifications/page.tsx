"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  CheckCheck,
  CircleDollarSign,
  Inbox,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/fetcher";

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

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const notificationsQuery = useQuery<PaginationResponse<NotificationItem>>({
    queryKey: ["notifications"],
    queryFn: () => fetcher("/notifications"),
  });

  const unreadCountQuery = useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => fetcher("/notifications/unread-count"),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => fetcher("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetcher(`/notifications/${notificationId}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const selectedNotification =
    notifications.find((notification) => notification.id === selectedNotificationId) ?? null;

  const unreadCount = useMemo(
    () => unreadCountQuery.data?.count ?? notifications.filter((item) => !item.isRead).length,
    [notifications, unreadCountQuery.data?.count],
  );

  const openNotification = async (notification: NotificationItem) => {
    setSelectedNotificationId(notification.id);

    if (!notification.isRead) {
      await markOneAsReadMutation.mutateAsync(notification.id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on bookings, payments, security, and account activity on Indanga."
        actions={
          <Button
            variant="outline"
            onClick={() => void markAllAsReadMutation.mutateAsync()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all as read
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Bell className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total updates</p>
              <p className="mt-1 text-xl font-semibold">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600">
              <BellRing className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="mt-1 text-xl font-semibold">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Safety status</p>
              <p className="mt-1 text-xl font-semibold">Secure</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Updates about your bookings, payments, and platform notices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl border bg-muted/40"
                />
              ))}
            </div>
          ) : notificationsQuery.isError ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                We could not load your notifications right now.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => void notificationsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Inbox className="size-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">No notifications yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your latest booking and account updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      void openNotification(notification);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void openNotification(notification);
                      }
                    }}
                    className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      notification.isRead
                        ? "bg-background"
                        : "border-primary/20 bg-primary/[0.03]"
                    }`}
                  >
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {!notification.isRead ? (
                            <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                              New
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {notification.message}
                      </p>

                      {!notification.isRead ? (
                        <div className="mt-4 flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void markOneAsReadMutation.mutateAsync(notification.id)}
                            disabled={markOneAsReadMutation.isPending}
                          >
                            Mark as read
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedNotification !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNotificationId(null);
          }
        }}
      >
        {selectedNotification ? (
          <DialogContent className="max-w-xl gap-5 rounded-2xl p-0">
            <div className="border-b px-5 pt-5 pb-4">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {(() => {
                      const Icon = getNotificationIcon(selectedNotification.type);
                      return <Icon className="size-5" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      {selectedNotification.title}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {formatDate(selectedNotification.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm leading-7 text-foreground">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                {!selectedNotification.isRead ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      void markOneAsReadMutation.mutateAsync(selectedNotification.id);
                    }}
                    disabled={markOneAsReadMutation.isPending}
                  >
                    Mark as read
                  </Button>
                ) : null}
                <Button onClick={() => setSelectedNotificationId(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
