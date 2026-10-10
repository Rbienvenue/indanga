"use client";

import { Bath, BedDouble, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BookingRequestStatus } from "./booking-request-status";
import { ReceiptDialog } from "@/components/payments/receipt-dialog";
import { MessageButton } from "@/components/messages/message-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingKind } from "@/lib/booking-kind";
import { firstImageUrl } from "@/lib/property-media";
import { cn, formatPrice } from "@/lib/utils";

export type BookingCardStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "REQUESTED"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "DECLINED"
  | "EXPIRED";

const statusStyles: Record<BookingCardStatus, string> = {
  PENDING: "bg-amber-500 text-white",
  APPROVED: "bg-green-600 text-white",
  REJECTED: "bg-red-600 text-white",
  CANCELLED: "bg-slate-500 text-white",
  COMPLETED: "bg-sky-600 text-white",
  REQUESTED: "bg-amber-500 text-white",
  AWAITING_PAYMENT: "bg-violet-600 text-white",
  CONFIRMED: "bg-green-600 text-white",
  DECLINED: "bg-red-600 text-white",
  EXPIRED: "bg-slate-500 text-white",
};

const statusLabels: Record<BookingCardStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Active",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  REQUESTED: "Request sent",
  AWAITING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

export interface BookingPropertyCardBooking {
  id: string;
  bookingId?: string | null;
  status: BookingCardStatus;
  paymentDeadline?: string | null;
  payments?: { id: string }[];
  declineReason?: string | null;
  responseDeadline?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number | null;
  totalAmount?: number | null;
  serviceFee?: number | null;
  unitPrice?: number | null;
  roomCount?: number | null;
  roomType?: { id: string; name: string; price: number } | null;
  house: {
    id: string;
    name: string;
    location: string;
    price: number | null;
    media?: string[];
    bedrooms: number;
    bathrooms: number;
    propertyType?: string;
  };
}

export function BookingPropertyCard({
  booking,
  selected,
  onSelect,
}: {
  booking: BookingPropertyCardBooking;
  selected: boolean;
  onSelect: () => void;
}) {
  const { house, status } = booking;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <Image
        src={firstImageUrl(house.media)}
        alt={house.name}
        width={64}
        height={64}
        sizes="64px"
        className="size-16 shrink-0 rounded-md object-contain"
      />
      <div className="min-w-0 flex-1 break-words">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{house.name}</p>
          <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.bookingId ?? "Booking request"}
          {house.propertyType ? ` · ${house.propertyType}` : ""}
        </p>
        {booking.checkIn && booking.checkOut ? (
          <p className="mt-2 text-sm">
            {new Date(booking.checkIn).toLocaleDateString()} →{" "}
            {new Date(booking.checkOut).toLocaleDateString()}
          </p>
        ) : null}
        {booking.totalAmount != null ? (
          <p className="mt-2 text-sm font-medium">{formatPrice(booking.totalAmount)} total</p>
        ) : null}
      </div>
    </button>
  );
}

export function BookingPropertyDetails({ booking }: { booking: BookingPropertyCardBooking }) {
  const { house } = booking;
  const dayLabel = getBookingKind(house.propertyType) === "car" ? "day" : "night";
  const hasStay = !!booking.checkIn && !!booking.checkOut;

  return (
    <Card className="h-fit gap-0">
      <CardHeader>
        <CardTitle>Booking details</CardTitle>
        <p className="break-all text-sm text-muted-foreground">
          {booking.bookingId ?? "Booking request"}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <Link href={`/properties/${house.id}`} className="text-base font-semibold hover:underline">
          {house.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="break-words">{house.location}</span>
        </div>

        {booking.totalAmount != null && (
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(booking.totalAmount)}
            </span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
        )}

        {booking.roomType ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {booking.roomType.name}
            {booking.roomCount && booking.roomCount > 1 ? ` × ${booking.roomCount} rooms` : ""}
            {booking.unitPrice != null ? ` · ${formatPrice(booking.unitPrice)} / night` : ""}
          </p>
        ) : null}

        {hasStay && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {new Date(booking.checkIn as string).toLocaleDateString()} →{" "}
              {new Date(booking.checkOut as string).toLocaleDateString()}
              {booking.nights ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {booking.nights} {dayLabel}
                  {booking.nights > 1 ? "s" : ""}
                </span>
              ) : null}
            </p>
          </div>
        )}

        <BookingRequestStatus booking={booking} inlinePayment={false} />

        <div className="relative z-10 mt-3 flex flex-wrap gap-2">
          <MessageButton bookingId={booking.id} />
          {booking.payments?.map((payment) => (
            <ReceiptDialog key={payment.id} paymentId={payment.id} />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
          {house.bedrooms > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BedDouble className="size-3.5" />
              {house.bedrooms} {house.bedrooms === 1 ? "Bed" : "Beds"}
            </div>
          )}
          {house.bathrooms > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bath className="size-3.5" />
              {house.bathrooms} {house.bathrooms === 1 ? "Bath" : "Baths"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
