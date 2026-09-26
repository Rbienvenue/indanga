"use client";

import type { House } from "@indanga/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/fetcher";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { getBookingKind } from "@/lib/booking-kind";
import { cn, formatPrice } from "@/lib/utils";
import {
  bookingSchema,
  requiresPhone,
  type BookingValues,
  type Gateway,
} from "@/lib/validations/booking";

type PaymentMethod = {
  method: "MOMO" | "AIRTEL" | "CARD";
  label: string;
  gateway: Gateway;
  logo: string;
};

const paymentMethods: PaymentMethod[] = [
  { label: "MoMo", gateway: "momo", method: "MOMO", logo: "/mtn.png" },
  { label: "Airtel Money", gateway: "airtel", method: "AIRTEL", logo: "/airtel.png" },
  { label: "Card", gateway: "card", method: "CARD", logo: "/cards.png" },
];

type PaymentResponse = {
  id: string;
  link?: string;
};

type PaymentStatus = "pending" | "successful" | "failed";

interface BookingCardProps {
  house: House;
  isAvailable: boolean;
  onBook: () => boolean;
  compact?: boolean;
}

export function BookingCard({ house, isAvailable, onBook, compact = false }: BookingCardProps) {
  const [step, setStep] = useState<"booking" | "payment" | "submitted">("booking");
  const [payment, setPayment] = useState<{ id: string; status: PaymentStatus } | null>(null);
  const { socket } = useSocketIo();
  const router = useRouter();
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { houseId: house.id, gateway: "momo", phone: "" },
  });
  const gateway = useWatch({ control: form.control, name: "gateway" });
  const paymentId = payment?.id;
  const bookingKind = getBookingKind(house.propertyType);
  const bookThisLabel = `Book this ${bookingKind}`;
  const priceUnitLabel =
    bookingKind === "hotel" ? "per night" : bookingKind === "car" ? "per day" : "per month";

  const paymentMutation = useMutation({
    mutationFn: async ({ houseId, gateway, phone }: BookingValues) => {
      const method = paymentMethods.find((item) => item.gateway === gateway)!.method;
      return fetcher<ApiResponse<PaymentResponse>>("/payments", {
        method: "POST",
        body: JSON.stringify({ houseId, method, phone: phone?.replace(/\D/g, "") }),
      });
    },
    onSuccess: ({ data }, values) => {
      if (values.gateway === "card") {
        if (data.link) {
          window.location.assign(data.link);
          return;
        }
        toast.error("Could not start card payment", {
          description: "Please try again or choose another payment method.",
        });
        return;
      }

      setPayment({ id: data.id, status: "pending" });
      setStep("submitted");
      toast.success("Payment prompt sent", {
        description: "Follow the instructions on your phone to complete payment.",
        position: "top-center",
      });
    },
    onError: (error) => {
      toast.error("Could not start booking", {
        description: error instanceof Error ? error.message : "Please try again.",
        position: "top-center",
      });
    },
  });

  useEffect(() => {
    if (!socket || !paymentId) return;

    function handlePaymentUpdate(update: { paymentId: string; status: PaymentStatus }) {
      if (update.paymentId !== paymentId) return;
      setPayment({ id: update.paymentId, status: update.status });
      if (update.status === "successful") {
        toast.success("Booking confirmed", { position: "top-center" });
        router.push("/dashboard/bookings");
      } else if (update.status === "failed") {
        toast.error("Payment failed", {
          description: "Please try again or choose another payment method.",
          position: "top-center",
        });
      }
    }

    socket.on("payment.update", handlePaymentUpdate);
    socket.emit("subscribe:payment", { paymentId });
    return () => {
      socket.off("payment.update", handlePaymentUpdate);
    };
  }, [paymentId, router, socket]);

  function beginCheckout() {
    if (onBook()) setStep("payment");
  }

  const submitting = paymentMutation.isPending;

  if (step === "booking") {
    if (compact) {
      return (
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-5">
          <p className="text-lg font-black">{formatPrice(house.price)}</p>
          <Button
            className="h-12 min-w-40 px-6 font-bold"
            disabled={!isAvailable}
            onClick={beginCheckout}
          >
            {isAvailable ? bookThisLabel : "Unavailable"}
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-slate-900/10 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
        <p className="text-2xl font-black tracking-tight">{formatPrice(house.price)}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{priceUnitLabel}</p>
        <Button
          className="mt-4 h-12 w-full text-base font-bold"
          disabled={!isAvailable}
          onClick={beginCheckout}
        >
          {isAvailable ? bookThisLabel : "Not available"}
        </Button>
        <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> Verified listing details
          </p>
          <p className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> Secure booking through INDANGA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900",
        compact
          ? "mx-auto max-w-2xl rounded-t-2xl border-x border-t p-4 shadow-lg"
          : "rounded-2xl border p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] dark:shadow-black/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black tracking-tight">{formatPrice(house.price)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{priceUnitLabel}</p>
        </div>
      </div>

      {step === "submitted" ? (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="font-semibold">
            {payment?.status === "successful"
              ? "Booking confirmed"
              : payment?.status === "failed"
                ? "Payment failed"
                : "Payment pending"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {payment?.status === "successful"
              ? `Your payment was successful and the ${bookingKind} is booked.`
              : payment?.status === "failed"
                ? "The payment could not be completed. Please try again."
                : "Check your phone and approve the payment to finish booking."}
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => paymentMutation.mutate(values))}
            className="mt-5 space-y-4"
          >
            <FormField
              control={form.control}
              name="gateway"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-semibold">Choose a payment method</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {paymentMethods.map(({ gateway: methodGateway, label, logo }) => {
                      const selected = field.value === methodGateway;
                      return (
                        <button
                          key={methodGateway}
                          type="button"
                          disabled={submitting}
                          aria-pressed={selected}
                          onClick={() => {
                            field.onChange(methodGateway);
                            form.clearErrors("phone");
                          }}
                          className={cn(
                            "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition-colors disabled:opacity-50",
                            selected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          <Image
                            src={logo}
                            alt=""
                            width={72}
                            height={32}
                            className="h-8 w-auto object-contain"
                          />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresPhone(gateway) ? (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="booking-phone" className="text-sm font-semibold">
                      {gateway === "momo" ? "MTN phone number" : "Airtel  phone number"}
                    </Label>
                    <FormControl>
                      <Input
                        id="booking-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="07X XXX XXXX"
                        className="mt-2 h-11"
                        disabled={submitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <Button type="submit" className="h-11 w-full font-bold" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Starting payment...
                </>
              ) : (
                <>
                  Continue to payment <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
