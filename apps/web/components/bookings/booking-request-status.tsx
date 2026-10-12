"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  Hourglass,
  Ticket,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import type { BookingPropertyCardBooking } from "@/components/bookings/booking-property-card";
import { BookingPaymentPanel } from "./booking-payment";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { MessageButton } from "@/components/messages/message-button";
import { fetcher } from "@/lib/fetcher";

type BookingStatusKey = BookingPropertyCardBooking["status"];

const statusGuidance: Record<BookingStatusKey, { title: string; message: string }> = {
  REQUESTED: {
    title: "Request received — sit back and relax",
    message:
      "Your request is now with the provider and everything is in motion. Providers usually respond within 30 minutes, and you'll be notified here as soon as they do. Your booking isn't confirmed yet, and no payment is required until it is.",
  },
  PENDING: {
    title: "Booking pending",
    message:
      "Your booking is still being processed. Check your payment history or contact support before making another payment.",
  },
  AWAITING_PAYMENT: {
    title: "Awaiting payment",
    message:
      "The provider accepted your request. Complete payment before the deadline to secure your booking.",
  },
  CONFIRMED: {
    title: "Booking confirmed",
    message: "Keep your booking reference and message the provider to arrange check-in or pickup.",
  },
  APPROVED: {
    title: "Booking active",
    message: "Keep your booking reference and message the provider to arrange check-in or pickup.",
  },
  DECLINED: {
    title: "Booking request declined",
    message:
      "The provider could not accept your request. Explore another listing or contact support for help.",
  },
  REJECTED: {
    title: "Booking request rejected",
    message: "This request was not accepted. Explore another listing or contact support for help.",
  },
  EXPIRED: {
    title: "Booking expired",
    message:
      "This reservation is no longer active. Explore another listing. If you made a payment, check your payment history and contact support.",
  },
  CANCELLED: {
    title: "Booking cancelled",
    message:
      "Review your payment history and contact support to check cancellation terms and any refund eligibility.",
  },
  COMPLETED: {
    title: "Booking completed",
    message:
      "Review your payment history and contact support if you have an unresolved issue with this booking.",
  },
};

const statusVisual: Record<BookingStatusKey, { icon: LucideIcon; tile: string; card: string }> = {
  REQUESTED: {
    icon: Clock,
    tile: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    card: "border-amber-500/30 bg-amber-500/[0.06]",
  },
  PENDING: {
    icon: Hourglass,
    tile: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    card: "border-amber-500/30 bg-amber-500/[0.06]",
  },
  AWAITING_PAYMENT: {
    icon: Clock,
    tile: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    card: "border-violet-500/30 bg-violet-500/[0.06]",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    tile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    card: "border-emerald-500/30 bg-emerald-500/[0.06]",
  },
  APPROVED: {
    icon: CheckCircle2,
    tile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    card: "border-emerald-500/30 bg-emerald-500/[0.06]",
  },
  DECLINED: {
    icon: XCircle,
    tile: "bg-destructive/10 text-destructive",
    card: "border-destructive/25 bg-destructive/[0.05]",
  },
  REJECTED: {
    icon: XCircle,
    tile: "bg-destructive/10 text-destructive",
    card: "border-destructive/25 bg-destructive/[0.05]",
  },
  EXPIRED: {
    icon: Ban,
    tile: "bg-muted text-muted-foreground",
    card: "border-border bg-muted/40",
  },
  CANCELLED: {
    icon: Ban,
    tile: "bg-muted text-muted-foreground",
    card: "border-border bg-muted/40",
  },
  COMPLETED: {
    icon: CheckCircle2,
    tile: "bg-muted text-muted-foreground",
    card: "border-border bg-muted/40",
  },
};

export function BookingRequestStatus({
  booking,
  onBookAgain,
  inlinePayment = true,
}: {
  booking: BookingPropertyCardBooking;
  onBookAgain?: () => void;
  inlinePayment?: boolean;
}) {
  const guidance = statusGuidance[booking.status];
  const explore = ["DECLINED", "REJECTED", "EXPIRED"].includes(booking.status);
  const showPayments = ["PENDING", "EXPIRED", "CANCELLED", "COMPLETED"].includes(booking.status);
  const cancellable = ["REQUESTED", "PENDING", "AWAITING_PAYMENT"].includes(booking.status);
  const [cancelOpen, setCancelOpen] = useState(false);
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<unknown>>(`/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setCancelOpen(false);
      toast.success("Booking cancelled", { position: "top-center" });
    },
    onError: (error) => {
      toast.error("Could not cancel booking", {
        description: error instanceof Error ? error.message : "Please try again.",
        position: "top-center",
      });
    },
  });

  const visual = statusVisual[booking.status];
  const StatusIcon = visual.icon;

  return (
    <div className={`relative z-10 mt-4 rounded-2xl border p-5 shadow-sm ${visual.card}`}>
      {booking.status === "AWAITING_PAYMENT" ? (
        <BookingPaymentPanel booking={booking} inline={inlinePayment} />
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${visual.tile}`}
            >
              <StatusIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold leading-6">{guidance.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{guidance.message}</p>
            </div>
          </div>
          {booking.status === "REQUESTED" && booking.responseDeadline ? (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2 text-sm">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
              <span>
                Provider response due by{" "}
                {new Date(booking.responseDeadline).toLocaleString("en-RW", {
                  timeZone: "Africa/Kigali",
                })}{" "}
                (Kigali).
              </span>
            </p>
          ) : null}
          {booking.status === "DECLINED" && booking.declineReason ? (
            <p className="mt-3 break-words rounded-lg bg-background/70 px-3 py-2 text-sm">
              <span className="font-medium">Reason: </span>
              {booking.declineReason}
            </p>
          ) : null}
          {booking.bookingId ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Ticket className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="break-all font-mono font-medium">{booking.bookingId}</span>
            </p>
          ) : null}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {explore ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/properties">Explore listings</Link>
          </Button>
        ) : null}
        {showPayments ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/payments">Payment history</Link>
          </Button>
        ) : null}
        {cancellable ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={cancelMutation.isPending}
            onClick={() => setCancelOpen(true)}
          >
            Cancel booking
          </Button>
        ) : null}
        <MessageButton label="Contact support" size="sm" />
      </div>
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking request will be withdrawn and the provider will be notified. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                cancelMutation.mutate();
              }}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="mt-2 text-xs text-muted-foreground">
        Include your booking reference when contacting support.
      </p>
      {booking.status === "CONFIRMED" && onBookAgain ? (
        <Button className="mt-3 w-full" variant="outline" onClick={onBookAgain}>
          Book again
        </Button>
      ) : null}
    </div>
  );
}
