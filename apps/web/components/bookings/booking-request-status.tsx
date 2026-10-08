"use client";

import type { BookingPropertyCardBooking } from "@/components/bookings/booking-property-card";
import { BookingPaymentPanel } from "./booking-payment";
import { Button } from "@/components/ui/button";

export function BookingRequestStatus({
  booking,
  onBookAgain,
}: {
  booking: BookingPropertyCardBooking;
  onBookAgain?: () => void;
}) {
  if (booking.status === "AWAITING_PAYMENT") {
    return <BookingPaymentPanel booking={booking} inline />;
  }

  const confirmed = booking.status === "CONFIRMED";

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="font-semibold">{confirmed ? "Booking confirmed" : "Booking request sent"}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {confirmed
          ? "Your payment was successful and the booking is secured."
          : "Your request was sent to the provider. Your booking is not confirmed yet. We will notify you when the provider responds. No payment is required yet."}
      </p>
      {booking.bookingId ? (
        <p className="mt-2 text-sm font-medium">Booking ID: {booking.bookingId}</p>
      ) : null}
      {booking.status === "CONFIRMED" && onBookAgain ? (
        <Button className="mt-3 w-full" variant="outline" onClick={onBookAgain}>
          Book again
        </Button>
      ) : null}
    </div>
  );
}
