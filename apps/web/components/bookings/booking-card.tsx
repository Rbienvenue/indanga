"use client";

import type { BookingStatus } from "@indanga/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageButton } from "@/components/messages/message-button";
import { fetcher } from "@/lib/fetcher";
import { firstImageUrl } from "@/lib/property-media";
import { formatPrice } from "@/lib/utils";

export type Booking = {
  id: string;
  bookingId: string | null;
  status: BookingStatus;
  checkIn: string | null;
  checkOut: string | null;
  totalAmount: number | null;
  roomCount: number | null;
  roomType: { name: string } | null;
  house: { id: string; name: string; location: string; media: string[] };
  client: { name: string; email: string };
};

const statusColors: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  REQUESTED: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  AWAITING_PAYMENT: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  COMPLETED: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  DECLINED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  EXPIRED: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="secondary" className={statusColors[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function BookingRequestActions({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: "AWAITING_PAYMENT" | "DECLINED") =>
      fetcher(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Booking request updated");
      void queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={mutation.isPending} onClick={() => mutation.mutate("AWAITING_PAYMENT")}>
        Accept request
      </Button>
      <Button
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("DECLINED")}
      >
        Decline
      </Button>
    </div>
  );
}

export function BookingDetails({ booking, isCar }: { booking?: Booking; isCar: boolean }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Booking details</CardTitle>
        <p className="text-sm text-muted-foreground">{booking?.bookingId ?? "Select a booking"}</p>
      </CardHeader>
      <CardContent>
        {booking ? (
          <div className="space-y-5">
            <div>
              <Link
                href={`/properties/${booking.house.id}`}
                className="font-semibold hover:underline"
              >
                {booking.house.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{booking.house.location}</p>
              {booking.roomType ? (
                <p className="mt-1 text-sm">
                  {booking.roomType.name} · {booking.roomCount ?? 1} room(s)
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {booking.checkIn ? (
                <div>
                  <dt className="text-muted-foreground">{isCar ? "Pickup" : "Check-in"}</dt>
                  <dd className="mt-1 font-medium">{formatDate(booking.checkIn)}</dd>
                </div>
              ) : null}
              {booking.checkOut ? (
                <div>
                  <dt className="text-muted-foreground">{isCar ? "Return" : "Check-out"}</dt>
                  <dd className="mt-1 font-medium">{formatDate(booking.checkOut)}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="mt-1 font-medium">{booking.client.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="mt-1 font-medium">
                  {booking.totalAmount != null ? formatPrice(booking.totalAmount) : "—"}
                </dd>
              </div>
            </dl>
            <p className="break-all rounded-lg bg-muted p-3 text-sm">{booking.client.email}</p>
            <MessageButton bookingId={booking.id} label="Message guest" />
            <BookingStatusBadge status={booking.status} />
            {booking.status === "REQUESTED" ? (
              <BookingRequestActions bookingId={booking.id} />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Choose a booking to review its details.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function BookingCard({
  booking,
  selected,
  onSelect,
}: {
  booking: Booking;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`rounded-lg border hover:bg-muted/50 ${selected ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="flex w-full items-start gap-3 rounded-lg p-4 text-left"
      >
        <Image
          src={firstImageUrl(booking.house.media)}
          alt={booking.house.name}
          width={64}
          height={64}
          sizes="64px"
          className="size-16 shrink-0 rounded-md object-contain"
        />
        <div className="min-w-0 flex-1 break-words">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{booking.house.name}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.client.name} · {booking.bookingId ?? "Booking request"}
          </p>
          {booking.checkIn && booking.checkOut ? (
            <p className="mt-2 text-sm">
              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </p>
          ) : null}
        </div>
      </button>
      {booking.status === "REQUESTED" ? (
        <div className="px-4 pb-4">
          <BookingRequestActions bookingId={booking.id} />
        </div>
      ) : null}
    </div>
  );
}
