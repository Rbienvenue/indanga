"use client";

import type { BookingPropertyCardBooking } from "@/components/bookings/booking-property-card";
import { BookingPaymentPanel } from "./booking-payment";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageButton } from "@/components/messages/message-button";

const statusGuidance: Record<
  BookingPropertyCardBooking["status"],
  { title: string; message: string }
> = {
  REQUESTED: {
    title: "Booking request sent",
    message:
      "Your request was sent to the provider. Your booking is not confirmed yet. We will notify you when the provider responds. No payment is required yet.",
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

  return (
    <div className="relative z-10 mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      {booking.status === "AWAITING_PAYMENT" ? (
        <BookingPaymentPanel booking={booking} inline={inlinePayment} />
      ) : (
        <>
          <p className="font-semibold">{guidance.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{guidance.message}</p>
          {booking.bookingId ? (
            <p className="mt-2 break-all text-sm font-medium">Booking ID: {booking.bookingId}</p>
          ) : null}
        </>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
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
        <MessageButton label="Contact support" size="sm" />
      </div>
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
