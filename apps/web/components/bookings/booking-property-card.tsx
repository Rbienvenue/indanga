"use client";

import { Bath, BedDouble, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBookingKind } from "@/lib/booking-kind";
import { firstImageUrl } from "@/lib/property-media";
import { cn, formatPrice } from "@/lib/utils";

export type BookingCardStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";

const statusStyles: Record<BookingCardStatus, string> = {
  PENDING: "bg-amber-500 text-white",
  APPROVED: "bg-green-600 text-white",
  REJECTED: "bg-red-600 text-white",
  CANCELLED: "bg-slate-500 text-white",
  COMPLETED: "bg-sky-600 text-white",
};

const statusLabels: Record<BookingCardStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Active",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export interface BookingPropertyCardBooking {
  id: string;
  status: BookingCardStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number | null;
  totalAmount?: number | null;
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

export function BookingPropertyCard({ booking }: { booking: BookingPropertyCardBooking }) {
  const { house, status } = booking;
  const image = firstImageUrl(house.media);
  const dayLabel = getBookingKind(house.propertyType) === "car" ? "day" : "night";
  const hasStay = !!booking.checkIn && !!booking.checkOut;

  return (
    <Card className="group relative h-full w-full gap-0 overflow-hidden border-border/50 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5">
      <Link
        href={`/properties/${house.id}`}
        aria-label={`View ${house.name}`}
        className="absolute inset-0 z-[1] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={image}
          alt={house.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {house.propertyType && (
          <Badge className="absolute top-3 left-3 z-10 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md">
            {house.propertyType}
          </Badge>
        )}
        <Badge
          className={cn(
            "absolute top-3 right-3 z-10 rounded-md px-2.5 py-1 text-xs font-semibold shadow-md",
            statusStyles[status],
          )}
        >
          {statusLabels[status]}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-foreground">{house.name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{house.location}</span>
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
