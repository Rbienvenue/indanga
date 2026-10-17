"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
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
import { cn, formatCurrency, formatBookingTotal } from "@/lib/utils";

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
        message: "validation.rwandaPhone",
      });
    }
  });

type PaymentQuote = {
  amount: number;
  currency: "RWF";
  originalAmount: number;
  originalCurrency: "USD" | "RWF";
  exchangeRate: number | null;
  rateDate: string | null;
  stale: boolean;
};

type BookingPayment = {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  checkoutUrl: string | null;
  amount: number | string;
  currency: "RWF";
  booking: { status: string };
};

function BookingPaymentForm({
  booking,
  onPaid,
}: {
  booking: BookingPropertyCardBooking;
  onPaid?: () => void;
}) {
  const t = useTranslations("payments");
  const locale = useLocale();
  const format = useFormatter();
  const paymentMethods = [
    { method: "MOMO", label: "MoMo", logo: "/mtn.png" },
    { method: "AIRTEL", label: "Airtel Money", logo: "/airtel.png" },
    { method: "CARD", label: t("card"), logo: "/cards.png" },
  ] as const;

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
  const quote = useQuery<ApiResponse<PaymentQuote>>({
    queryKey: ["payment-quote", session?.user.id, booking.id],
    queryFn: () => fetcher(`/payments/quote/${encodeURIComponent(booking.id)}`),
    enabled: Boolean(session?.user) && !deadlinePassed && !paymentId && !completed,
    staleTime: 0,
  });
  const charge = paymentId || completed ? Number(payment?.amount) : quote.data?.data.amount;
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof paymentSchema>) => {
      if (!booking.paymentDeadline || new Date(booking.paymentDeadline) <= new Date()) {
        throw new Error(t("deadlineError"));
      }
      if (!quote.data) throw new Error(t("waitQuote"));
      return fetcher<ApiResponse<{ id: string; link?: string; amount: number; currency: "RWF" }>>(
        "/payments",
        {
          method: "POST",
          body: JSON.stringify({
            bookingId: booking.id,
            expectedAmount: quote.data.data.amount,
            method: values.method,
            ...(values.method === "CARD" ? {} : { phone: values.phone.replace(/\D/g, "") }),
          }),
        },
      );
    },
    onSuccess: ({ data }, values) => {
      queryClient.setQueryData<PaginationResponse<BookingPayment>>(paymentKey, {
        data: [
          {
            id: data.id,
            status: "PENDING",
            method: values.method,
            checkoutUrl: data.link ?? null,
            amount: data.amount,
            currency: data.currency,
            booking: { status: booking.status },
          },
        ],
        meta: { total: 1, page: 1, limit: 1, totalPages: 1 },
      });
      void refreshPayment();
      if (values.method === "CARD") {
        if (data.link) window.location.assign(data.link);
        else toast.error(t("cardError"));
        return;
      }
      toast.success(t("promptSent"), {
        description: t("phoneInstructions"),
      });
    },
    onError: () => {
      void refreshPayment();
      void quote.refetch();
      toast.error(t("startError"), { description: t("startErrorDescription") });
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
          toast.success(t("confirmed"));
          onPaid?.();
        } else toast.info(t("receivedSupport"));
      } else if (latest?.status === "FAILED") {
        toast.error(t("failed"), { description: t("retryBeforeDeadline") });
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
  }, [isConnected, onPaid, paymentId, queryClient, refreshPayment, socket, t]);

  useEffect(() => {
    if (payment?.status !== "COMPLETED") return;
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
  }, [payment?.status, queryClient]);

  const disabled =
    mutation.isPending ||
    Boolean(paymentId) ||
    completed ||
    recovery.isPending ||
    recovery.isError ||
    quote.isPending ||
    quote.isError ||
    quote.isFetching;
  const kind = getBookingKind(booking.house.propertyType);
  const quantity = kind === "hotel" ? (booking.roomCount ?? 1) : 1;
  const duration = kind === "home" ? (booking.months ?? 1) : (booking.nights ?? 1);
  const unitPrice = booking.unitPrice ?? booking.house.price ?? 0;
  const subtotal = unitPrice * quantity * duration;
  const serviceFee =
    booking.serviceFee ??
    Math.max(0, (booking.totalAmount ?? subtotal) - subtotal - (booking.cautionFee ?? 0));

  return (
    <div className="space-y-4">
      <BookingPriceSummary
        bookingKind={kind}
        currency={booking.currency ?? booking.house.currency}
        unitPrice={unitPrice}
        months={booking.months}
        nights={booking.nights ?? 0}
        quantity={quantity}
        subtotal={subtotal}
        cautionFee={booking.cautionFee}
        serviceFee={serviceFee}
        serviceFeeCurrency={
          booking.serviceFeeCurrency ?? booking.currency ?? booking.house.currency
        }
        serviceFeeConfig={{
          bookingKind: kind,
          feeType: "fixed",
          amount: serviceFee,
          isActive: true,
        }}
        total={booking.totalAmount ?? subtotal}
        ready
      />
      {charge != null ? (
        <div className="rounded-lg bg-muted p-3 text-sm" role="status">
          <p className="font-medium">
            {t("charge", { amount: formatCurrency(charge, "RWF", locale) })}
          </p>
        </div>
      ) : null}
      {quote.isError && !paymentId && !completed ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>{t("quoteError")}</p>
          <Button variant="outline" size="sm" onClick={() => void quote.refetch()}>
            {t("retryRate")}
          </Button>
        </div>
      ) : null}
      {booking.checkIn && booking.checkOut ? (
        <p className="text-sm text-muted-foreground">
          {format.dateTime(new Date(booking.checkIn), { dateStyle: "medium" })} →{" "}
          {format.dateTime(new Date(booking.checkOut), { dateStyle: "medium" })}
          {booking.roomType ? ` · ${booking.roomType.name}` : ""}
        </p>
      ) : null}
      {recovery.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>{t("previousPaymentError")}</p>
          <Button variant="outline" size="sm" onClick={() => void refreshPayment()}>
            {t("checkStatus")}
          </Button>
        </div>
      ) : null}
      {completed ? (
        <div role="status" className="space-y-3 rounded-lg bg-muted p-3">
          <p className="text-sm">
            {payment.booking.status === "CONFIRMED" || payment.booking.status === "APPROVED"
              ? t("receivedConfirmed")
              : t("receivedReview")}
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
                <Label className="text-sm font-semibold">{t("chooseMethod")}</Label>
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
                    {method === "MOMO" ? t("mtnPhone") : t("airtelPhone")}
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
              t("received")
            ) : recovery.isPending ? (
              t("checkingPrevious")
            ) : recovery.isError ? (
              t("checkStatusFirst")
            ) : deadlinePassed ? (
              t("deadlinePassed")
            ) : disabled ? (
              <>
                <Loader2 className="size-4 animate-spin" />{" "}
                {paymentId
                  ? t("waitingPayment")
                  : mutation.isPending
                    ? t("startingPayment")
                    : t("gettingAmount")}
              </>
            ) : (
              <>
                {t("pay", { amount: formatBookingTotal(booking, locale) })}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          {paymentId ? (
            <div role="status" className="space-y-3 rounded-lg bg-muted p-3">
              <p className="text-sm">
                {payment?.method === "CARD" ? t("cardPending") : t("mobilePending")}{" "}
                {t("noDuplicate")}
              </p>
              {booking.bookingId ? (
                <p className="break-all text-xs">{t("bookingId", { id: booking.bookingId })}</p>
              ) : null}
              {payment?.method === "CARD" && payment.checkoutUrl && !deadlinePassed ? (
                <Button asChild size="sm">
                  <a href={payment.checkoutUrl}>{t("continueCard")}</a>
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
  const t = useTranslations("payments");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const deadline = booking.paymentDeadline ? new Date(booking.paymentDeadline) : null;
  const deadlinePassed = !deadline || deadline <= new Date();
  return (
    <div className={cn("relative z-10", !inline && "mt-4 border-t border-border/50 pt-4")}>
      <p className="text-sm font-medium">{t("availabilityConfirmed")}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("paymentDeadline", {
          date: deadline
            ? format.dateTime(deadline, {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Kigali",
              })
            : "—",
        })}
      </p>
      {booking.bookingId ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("bookingId", { id: booking.bookingId })}
        </p>
      ) : null}
      {inline ? (
        <div className="mt-5">
          <BookingPaymentForm booking={booking} />
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-3 w-full" disabled={deadlinePassed}>
              {deadlinePassed ? t("deadlinePassed") : t("completePayment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[70dvh] overflow-y-auto sm:max-w-xl sm:p-4">
            <DialogHeader>
              <DialogTitle>{t("completePayment")}</DialogTitle>
              <DialogDescription>{t("payBeforeDeadline")}</DialogDescription>
            </DialogHeader>
            <BookingPaymentForm booking={booking} onPaid={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
