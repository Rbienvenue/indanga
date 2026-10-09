"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import type { ApiResponse, PaginationResponse } from "@/@types";
import type { BookingPropertyCardBooking } from "./booking-property-card";
import { BookingPriceSummary } from "@/components/houses/BookingPriceSummary";
import { useSession } from "@/components/providers/session-provider";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { Button } from "@/components/ui/button";
import { ReceiptDialog } from "@/components/payments/receipt-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBookingKind } from "@/lib/booking-kind";
import { fetcher } from "@/lib/fetcher";
import { cn, formatPrice } from "@/lib/utils";

const paymentMethods = [
  { method: "MOMO", label: "MoMo", logo: "/mtn.png" },
  { method: "AIRTEL", label: "Airtel Money", logo: "/airtel.png" },
  { method: "CARD", label: "Card", logo: "/cards.png" },
] as const;

const paymentSchema = z
  .object({
    method: z.enum(["MOMO", "AIRTEL", "CARD"]),
    phone: z.string(),
  })
  .superRefine(({ method, phone }, ctx) => {
    if (method !== "CARD" && !/^(2507[2-9]\d{7}|07[2-9]\d{7})$/.test(phone.replace(/\D/g, ""))) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid Rwandan phone number",
      });
    }
  });

type BookingPayment = {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  checkoutUrl: string | null;
  booking: { status: string };
};

function BookingPaymentForm({
  booking,
  onPaid,
}: {
  booking: BookingPropertyCardBooking;
  onPaid?: () => void;
}) {
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "MOMO", phone: "" },
  });
  const chosenMethod = useWatch({ control: form.control, name: "method" });
  const session = useSession();
  const queryClient = useQueryClient();
  const paymentKey = ["booking-payment", session?.user.id, booking.id];
  const recovery = useQuery<PaginationResponse<BookingPayment>>({
    queryKey: paymentKey,
    queryFn: () => fetcher(`/payments?bookingId=${encodeURIComponent(booking.id)}&limit=1`),
    enabled: Boolean(session?.user),
    refetchInterval: (query) => (query.state.data?.data[0]?.status === "PENDING" ? 15000 : false),
  });
  const { refetch: refreshPayment } = recovery;
  const payment = recovery.data?.data[0];
  const paymentId = payment?.status === "PENDING" ? payment.id : null;
  const method = paymentId ? payment?.method : chosenMethod;
  const completed = payment?.status === "COMPLETED";
  const { socket, isConnected } = useSocketIo(Boolean(paymentId));
  const deadlinePassed =
    !booking.paymentDeadline || new Date(booking.paymentDeadline) <= new Date();
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof paymentSchema>) => {
      if (!booking.paymentDeadline || new Date(booking.paymentDeadline) <= new Date()) {
        throw new Error("The payment deadline has passed");
      }
      return fetcher<ApiResponse<{ id: string; link?: string }>>("/payments", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          method: values.method,
          ...(values.method === "CARD" ? {} : { phone: values.phone.replace(/\D/g, "") }),
        }),
      });
    },
    onSuccess: ({ data }, values) => {
      queryClient.setQueryData<PaginationResponse<BookingPayment>>(paymentKey, {
        data: [
          {
            id: data.id,
            status: "PENDING",
            method: values.method,
            checkoutUrl: data.link ?? null,
            booking: { status: booking.status },
          },
        ],
        meta: { total: 1, page: 1, limit: 1, totalPages: 1 },
      });
      void refreshPayment();
      if (values.method === "CARD") {
        if (data.link) window.location.assign(data.link);
        else toast.error("Could not start card payment");
        return;
      }
      toast.success("Payment prompt sent", {
        description: "Follow the instructions on your phone to complete payment.",
      });
    },
    onError: (error: Error) => {
      void refreshPayment();
      toast.error("Could not start payment", { description: error.message });
    },
  });

  useEffect(() => {
    if (!socket || !isConnected || !paymentId) return;
    const refresh = () => {
      void refreshPayment();
    };
    const handleUpdate = async (update: { paymentId: string; status: string }) => {
      if (update.paymentId !== paymentId) return;
      const result = await refreshPayment();
      const latest = result.data?.data[0];
      if (latest?.status === "COMPLETED") {
        void queryClient.invalidateQueries({ queryKey: ["bookings"] });
        void queryClient.invalidateQueries({ queryKey: ["payments"] });
        if (latest.booking.status === "CONFIRMED" || latest.booking.status === "APPROVED") {
          toast.success("Booking confirmed.");
          onPaid?.();
        } else toast.info("Payment received. Contact support to review your booking.");
      } else if (latest?.status === "FAILED") {
        toast.error("Payment failed", { description: "You can retry before the deadline." });
      }
    };
    // Recheck after joining the room to recover any update missed while disconnected.
    socket.on("subscribed:payment", refresh);
    socket.on("payment.update", handleUpdate);
    socket.emit("subscribe:payment", { paymentId });
    return () => {
      socket.off("subscribed:payment", refresh);
      socket.off("payment.update", handleUpdate);
    };
  }, [isConnected, onPaid, paymentId, queryClient, refreshPayment, socket]);

  useEffect(() => {
    if (payment?.status !== "COMPLETED") return;
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
  }, [payment?.status, queryClient]);

  const disabled =
    mutation.isPending || Boolean(paymentId) || completed || recovery.isPending || recovery.isError;
  const kind = getBookingKind(booking.house.propertyType);
  const quantity = booking.roomCount ?? 1;
  const duration = kind === "home" ? 1 : (booking.nights ?? 1);
  const unitPrice = booking.unitPrice ?? booking.house.price ?? 0;
  const subtotal = unitPrice * quantity * duration;
  const serviceFee =
    booking.serviceFee ?? Math.max(0, (booking.totalAmount ?? subtotal) - subtotal);

  return (
    <div className="space-y-4">
      <BookingPriceSummary
        bookingKind={kind}
        unitPrice={unitPrice}
        nights={booking.nights ?? 0}
        quantity={quantity}
        subtotal={subtotal}
        serviceFee={serviceFee}
        serviceFeeConfig={{
          bookingKind: kind,
          feeType: "fixed",
          amount: serviceFee,
          isActive: true,
        }}
        total={booking.totalAmount ?? subtotal}
        ready
      />
      {booking.checkIn && booking.checkOut ? (
        <p className="text-sm text-muted-foreground">
          {new Date(booking.checkIn).toLocaleDateString()} →{" "}
          {new Date(booking.checkOut).toLocaleDateString()}
          {booking.roomType ? ` · ${booking.roomType.name}` : ""}
        </p>
      ) : null}
      {recovery.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>Could not check your previous payment. Check its status before paying again.</p>
          <Button variant="outline" size="sm" onClick={() => void refreshPayment()}>
            Check payment status
          </Button>
        </div>
      ) : null}
      {completed ? (
        <div role="status" className="space-y-3 rounded-lg bg-muted p-3">
          <p className="text-sm">
            {payment.booking.status === "CONFIRMED" || payment.booking.status === "APPROVED"
              ? "Payment received. Your booking is confirmed."
              : "Payment received. Contact support to review your booking before making another payment."}
          </p>
          <ReceiptDialog paymentId={payment.id} />
        </div>
      ) : null}
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-semibold">Choose a payment method</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {paymentMethods.map((item) => (
                    <button
                      key={item.method}
                      type="button"
                      disabled={disabled || deadlinePassed}
                      aria-pressed={method === item.method}
                      onClick={() => {
                        field.onChange(item.method);
                        form.clearErrors("phone");
                      }}
                      className={cn(
                        "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition-colors disabled:opacity-50",
                        method === item.method
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <Image
                        src={item.logo}
                        alt=""
                        width={72}
                        height={32}
                        className="h-8 w-auto object-contain"
                      />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {method !== "CARD" ? (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={`payment-phone-${booking.id}`} className="text-sm font-semibold">
                    {method === "MOMO" ? "MTN phone number" : "Airtel phone number"}
                  </Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={`payment-phone-${booking.id}`}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="07X XXX XXXX"
                      className="mt-2 h-11"
                      disabled={disabled || deadlinePassed}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <Button
            type="submit"
            className="h-11 w-full font-bold"
            disabled={disabled || deadlinePassed}
          >
            {completed ? (
              "Payment received"
            ) : recovery.isPending ? (
              "Checking previous payment…"
            ) : recovery.isError ? (
              "Check payment status first"
            ) : deadlinePassed ? (
              "Payment deadline passed"
            ) : disabled ? (
              <>
                <Loader2 className="size-4 animate-spin" />{" "}
                {paymentId ? "Waiting for payment…" : "Starting payment…"}
              </>
            ) : (
              <>
                Pay {formatPrice(booking.totalAmount ?? 0)} <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          {paymentId ? (
            <div role="status" className="space-y-3 rounded-lg bg-muted p-3">
              <p className="text-sm">
                {payment?.method === "CARD"
                  ? "Your card payment is awaiting confirmation. Continue the same checkout to finish."
                  : "Your payment is being confirmed. If prompted, approve it on your phone."}{" "}
                Do not submit another payment.
              </p>
              {booking.bookingId ? (
                <p className="break-all text-xs">Booking ID: {booking.bookingId}</p>
              ) : null}
              {payment?.method === "CARD" && payment.checkoutUrl && !deadlinePassed ? (
                <Button asChild size="sm">
                  <a href={payment.checkoutUrl}>Continue card payment</a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </form>
      </Form>
    </div>
  );
}

export function BookingPaymentPanel({
  booking,
  inline = false,
}: {
  booking: BookingPropertyCardBooking;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deadline = booking.paymentDeadline ? new Date(booking.paymentDeadline) : null;
  const deadlinePassed = !deadline || deadline <= new Date();
  return (
    <div className={cn("relative z-10", !inline && "mt-4 border-t border-border/50 pt-4")}>
      <p className="text-sm font-medium">Availability confirmed.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The provider accepted your request. Complete payment by{" "}
        {deadline?.toLocaleString("en-RW", { timeZone: "Africa/Kigali" })} to secure the booking.
      </p>
      {booking.bookingId ? (
        <p className="mt-2 text-xs text-muted-foreground">Booking ID: {booking.bookingId}</p>
      ) : null}
      {inline ? (
        <div className="mt-5">
          <BookingPaymentForm booking={booking} />
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-3 w-full" disabled={deadlinePassed}>
              {deadlinePassed ? "Payment deadline passed" : "Complete payment"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[70dvh] overflow-y-auto sm:max-w-xl sm:p-4">
            <DialogHeader>
              <DialogTitle>Complete payment</DialogTitle>
              <DialogDescription>
                Pay before the deadline to confirm your booking.
              </DialogDescription>
            </DialogHeader>
            <BookingPaymentForm booking={booking} onPaid={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
