"use client";

import { useEffect, useState } from "react";
import { Bath, BedDouble, CalendarDays, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { getBookingKind } from "@/lib/booking-kind";
import { fetcher } from "@/lib/fetcher";
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

type PaymentMethod = "MOMO" | "AIRTEL" | "CARD";

function BookingPayment({ booking }: { booking: BookingPropertyCardBooking }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("MOMO");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocketIo(Boolean(paymentId));
  const deadline = booking.paymentDeadline ? new Date(booking.paymentDeadline) : null;
  const deadlinePassed = !deadline || deadline <= new Date();

  const paymentMutation = useMutation({
    mutationFn: () => {
      if (method !== "CARD") {
        const digits = phone.replace(/\D/g, "");
        if (!/^(2507[2-9]\d{7}|07[2-9]\d{7})$/.test(digits)) {
          throw new Error("Enter a valid Rwandan phone number");
        }
      }
      return fetcher<ApiResponse<{ id: string; link?: string }>>("/payments", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          method,
          ...(method === "CARD" ? {} : { phone: phone.replace(/\D/g, "") }),
        }),
      });
    },
    onSuccess: ({ data }) => {
      if (method === "CARD") {
        if (data.link) {
          window.location.assign(data.link);
          return;
        }
        toast.error("Could not start card payment", {
          description: "Please try again or choose another payment method.",
        });
        return;
      }
      setPaymentId(data.id);
      toast.success("Payment prompt sent", {
        description: "Follow the instructions on your phone to complete payment.",
      });
    },
    onError: (error) => {
      toast.error("Could not start payment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  useEffect(() => {
    if (!socket || !isConnected || !paymentId) return;

    function handlePaymentUpdate(update: {
      paymentId: string;
      status: "pending" | "successful" | "failed";
    }) {
      if (update.paymentId !== paymentId) return;
      if (update.status === "successful") {
        toast.success("Booking confirmed");
        setOpen(false);
        void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      }
      if (update.status === "failed") {
        toast.error("Payment failed", { description: "You can retry before the deadline." });
      }
    }

    socket.on("payment.update", handlePaymentUpdate);
    socket.emit("subscribe:payment", { paymentId });
    return () => {
      socket.off("payment.update", handlePaymentUpdate);
    };
  }, [isConnected, paymentId, queryClient, socket]);

  return (
    <div className="relative z-10 mt-4 border-t border-border/50 pt-4">
      <p className="text-sm font-medium">Availability confirmed.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The provider accepted your request. Complete payment by{" "}
        {deadline?.toLocaleString("en-RW", { timeZone: "Africa/Kigali" })} to secure the booking.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full" disabled={deadlinePassed}>
            {deadlinePassed ? "Payment deadline passed" : "Complete payment"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete payment</DialogTitle>
            <DialogDescription>
              Pay {formatPrice(booking.totalAmount ?? 0)} before the deadline to confirm the
              booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment method</Label>
              <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOMO">MTN MoMo</SelectItem>
                  <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {method !== "CARD" ? (
              <div>
                <Label htmlFor={`payment-phone-${booking.id}`}>Phone number</Label>
                <Input
                  id={`payment-phone-${booking.id}`}
                  className="mt-2"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07X XXX XXXX"
                />
              </div>
            ) : null}
            <Button
              className="w-full"
              disabled={paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              {paymentMutation.isPending ? <Loader2 className="animate-spin" /> : null}
              Pay {formatPrice(booking.totalAmount ?? 0)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BookingPropertyCard({ booking }: { booking: BookingPropertyCardBooking }) {
  const { house, status } = booking;
  const image = house.media && house.media.length > 0 ? house.media[0] : "/image2.jpeg";
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

        {booking.bookingId ? (
          <p className="relative z-10 mt-3 text-xs font-medium text-muted-foreground">
            Booking ID: {booking.bookingId}
          </p>
        ) : null}

        {status === "REQUESTED" ? (
          <p className="relative z-10 mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Your request was sent to the provider. Your booking is not confirmed yet. We will notify
            you when the provider responds. No payment is required yet.
          </p>
        ) : null}

        {status === "AWAITING_PAYMENT" ? <BookingPayment booking={booking} /> : null}

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
