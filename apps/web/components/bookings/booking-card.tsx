"use client";

import type { BookingStatus } from "@indanga/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptDialog } from "@/components/payments/receipt-dialog";
import { MessageButton } from "@/components/messages/message-button";
import { fetcher } from "@/lib/fetcher";
import { getBookingKind } from "@/lib/booking-kind";
import { firstImageUrl } from "@/lib/property-media";
import { formatCurrency, formatBookingTotal } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const declineReasons = [
  "Unavailable for the requested dates",
  "Unavailable due to maintenance",
  "Booking requirements not met",
  "Unable to accommodate this request",
  "Other",
] as const;

const declineSchema = z
  .object({
    reason: z.enum(declineReasons, { error: "Select a reason for declining" }),
    declineReason: z.string().trim().max(500),
  })
  .superRefine((values, context) => {
    if (values.reason === "Other" && values.declineReason.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["declineReason"],
        message: "Explain why you cannot accept this request",
      });
    }
  });

export type Booking = {
  id: string;
  bookingId: string | null;
  status: BookingStatus;
  declineReason?: string | null;
  payments?: { id: string }[];
  responseDeadline?: string | null;
  checkIn: string | null;
  checkOut: string | null;
  totalAmount: number | null;
  currency?: string | null;
  serviceFee?: number | null;
  serviceFeeCurrency?: string | null;
  months?: number | null;
  roomCount: number | null;
  guestCount?: number | null;
  roomType: { name: string } | null;
  house: {
    id: string;
    name: string;
    location: string;
    media: string[];
    currency: string;
    propertyType?: string;
  };
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

export function BookingRequestActions({
  bookingId,
  responseDeadline,
}: {
  bookingId: string;
  responseDeadline?: string | null;
}) {
  const expired = Boolean(responseDeadline && new Date(responseDeadline) <= new Date());
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof declineSchema>>({
    resolver: zodResolver(declineSchema),
    defaultValues: { declineReason: "" },
  });
  const selectedReason = form.watch("reason");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { status: "AWAITING_PAYMENT" | "DECLINED"; declineReason?: string }) =>
      fetcher(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Booking request updated");
      setOpen(false);
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        disabled={mutation.isPending || expired}
        onClick={() => mutation.mutate({ status: "AWAITING_PAYMENT" })}
      >
        Accept request
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={mutation.isPending || expired}>
            Decline
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline booking request</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) =>
                mutation.mutate({
                  status: "DECLINED",
                  declineReason: values.reason === "Other" ? values.declineReason : values.reason,
                }),
              )}
            >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason shown to the customer</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {declineReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedReason === "Other" ? (
                <FormField
                  control={form.control}
                  name="declineReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom reason shown to the customer</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Explain why you cannot accept this request"
                          maxLength={500}
                          disabled={mutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? "Declining…" : "Decline request"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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
              {getBookingKind(booking.house.propertyType) === "home" ? (
                <div>
                  <dt className="text-muted-foreground">Number of months</dt>
                  <dd className="mt-1 font-medium">{booking.months ?? 1}</dd>
                </div>
              ) : null}
              {booking.guestCount != null ? (
                <div>
                  <dt className="text-muted-foreground">Number of guests</dt>
                  <dd className="mt-1 font-medium">{booking.guestCount}</dd>
                </div>
              ) : null}
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
                  {booking.totalAmount != null ? formatBookingTotal(booking) : "—"}
                </dd>
              </div>
            </dl>
            <p className="break-all rounded-lg bg-muted p-3 text-sm">{booking.client.email}</p>
            <div className="flex flex-wrap gap-2">
              <MessageButton label="Contact support" />
            </div>
            <p className="text-xs text-muted-foreground">
              Include the booking reference above when contacting support.
            </p>
            <BookingStatusBadge status={booking.status} />
            {booking.status === "REQUESTED" && booking.responseDeadline ? (
              <p className="text-sm">
                Respond by{" "}
                {new Date(booking.responseDeadline).toLocaleString("en-RW", {
                  timeZone: "Africa/Kigali",
                })}{" "}
                (Kigali).
              </p>
            ) : null}
            {booking.declineReason ? (
              <p className="break-words text-sm">Decline reason: {booking.declineReason}</p>
            ) : null}
            {booking.status === "REQUESTED" ? (
              <BookingRequestActions
                bookingId={booking.id}
                responseDeadline={booking.responseDeadline}
              />
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
      {booking.payments?.length ? (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {booking.payments.map((payment) => (
            <ReceiptDialog key={payment.id} paymentId={payment.id} />
          ))}
        </div>
      ) : null}
      {booking.status === "REQUESTED" ? (
        <div className="px-4 pb-4">
          <BookingRequestActions
            bookingId={booking.id}
            responseDeadline={booking.responseDeadline}
          />
        </div>
      ) : null}
    </div>
  );
}
