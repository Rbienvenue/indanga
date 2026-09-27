"use client";

import type { House, RoomType } from "@indanga/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, BedDouble, CalendarIcon, Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { getBookingKind } from "@/lib/booking-kind";
import { cn, formatPrice } from "@/lib/utils";
import {
  bookingSchema,
  datedBookingSchema,
  getNights,
  hotelBookingSchema,
  requiresPhone,
  type BookingValues,
  type Gateway,
} from "@/lib/validations/booking";
import { addDays, format, startOfDay } from "date-fns";

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

type RoomAvailability = {
  roomType: RoomType;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
};

interface BookingCardProps {
  house: House & { rooms?: RoomType[] };
  isAvailable: boolean;
  onBook: () => boolean;
  compact?: boolean;
}

export function BookingCard({ house, isAvailable, onBook, compact = false }: BookingCardProps) {
  const [step, setStep] = useState<"booking" | "payment" | "submitted">("booking");
  const [payment, setPayment] = useState<{ id: string; status: PaymentStatus } | null>(null);
  const { socket } = useSocketIo();
  const router = useRouter();
  const bookingKind = getBookingKind(house.propertyType);
  const isDated = bookingKind === "hotel" || bookingKind === "car";
  const isHotel = bookingKind === "hotel";
  const rooms = house.rooms ?? [];
  const roomPrices = rooms.map((room) => room.price);
  const fromPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null;
  const form = useForm<BookingValues>({
    resolver: zodResolver(isHotel ? hotelBookingSchema : isDated ? datedBookingSchema : bookingSchema),
    defaultValues: {
      houseId: house.id,
      gateway: "momo",
      phone: "",
      checkIn: "",
      checkOut: "",
      roomTypeId: "",
      roomCount: 1,
    },
  });
  const gateway = useWatch({ control: form.control, name: "gateway" });
  const checkIn = useWatch({ control: form.control, name: "checkIn" });
  const checkOut = useWatch({ control: form.control, name: "checkOut" });
  const roomTypeId = useWatch({ control: form.control, name: "roomTypeId" });
  const roomCount = useWatch({ control: form.control, name: "roomCount" });
  const paymentId = payment?.id;
  const nights = isDated ? getNights(checkIn, checkOut) : 0;
  const selectedRoom = isHotel ? rooms.find((room) => room.id === roomTypeId) : undefined;
  const quantity = isHotel ? Math.max(Number(roomCount) || 1, 1) : 1;
  const unitPrice = selectedRoom?.price ?? house.price ?? fromPrice ?? 0;
  const total = isHotel
    ? unitPrice * quantity * (nights > 0 ? nights : 1)
    : isDated && nights > 0
      ? unitPrice * nights
      : unitPrice;

  const availabilityQuery = useQuery({
    queryKey: ["properties", house.id, "availability", checkIn, checkOut],
    queryFn: () =>
      fetcher<ApiResponse<RoomAvailability[]>>(
        `/properties/${house.id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
      ),
    enabled: isHotel && step === "payment" && Boolean(checkIn) && Boolean(checkOut) && nights > 0,
  });
  const availabilityByRoom = new Map(
    (availabilityQuery.data?.data ?? []).map((entry) => [entry.roomType.id, entry]),
  );
  const selectedAvailability = roomTypeId ? availabilityByRoom.get(roomTypeId) : undefined;
  const maxRooms = selectedAvailability
    ? selectedAvailability.availableRooms
    : (selectedRoom?.totalRooms ?? 1);
  const dayLabel = bookingKind === "car" ? "day" : "night";
  const today = startOfDay(new Date());
  const checkInDate = checkIn ? new Date(`${checkIn}T00:00:00`) : undefined;
  const checkOutDate = checkOut ? new Date(`${checkOut}T00:00:00`) : undefined;
  const checkOutMinDate = checkInDate ? addDays(checkInDate, 1) : addDays(today, 1);
  const bookThisLabel = `Book this ${bookingKind === "car" ? "car" : "room"}`;
  const priceUnitLabel =
    bookingKind === "hotel" ? "per night" : bookingKind === "car" ? "per day" : "per month";

  const paymentMutation = useMutation({
    mutationFn: async ({ houseId, gateway, phone, checkIn, checkOut, roomTypeId, roomCount }: BookingValues) => {
      const method = paymentMethods.find((item) => item.gateway === gateway)!.method;
      return fetcher<ApiResponse<PaymentResponse>>("/payments", {
        method: "POST",
        body: JSON.stringify({
          houseId,
          method,
          phone: phone?.replace(/\D/g, ""),
          ...(isDated ? { checkIn, checkOut } : {}),
          ...(isHotel ? { roomTypeId, roomCount: Number(roomCount) || 1 } : {}),
        }),
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
  const cardPrice = house.price ?? fromPrice;
  const cardPriceLabel =
    cardPrice != null ? (
      <>
        {house.price == null && fromPrice != null ? (
          <span className="mr-1 text-sm font-semibold text-slate-500 dark:text-slate-400">From</span>
        ) : null}
        {formatPrice(cardPrice)}
      </>
    ) : (
      "Contact for price"
    );

  if (step === "booking") {
    if (compact) {
      return (
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-5">
          <p className="text-lg font-black">{cardPriceLabel}</p>
          <Button
            className="h-12 min-w-40 px-6 font-bold"
            disabled={!isAvailable || (isHotel && rooms.length === 0)}
            onClick={beginCheckout}
          >
            {isAvailable ? bookThisLabel : "Unavailable"}
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full rounded-2xl border border-slate-900/10 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
        <p className="text-2xl font-black tracking-tight">{cardPriceLabel}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{priceUnitLabel}</p>
        <Button
          className="mt-4 h-12 w-full text-base font-bold"
          disabled={!isAvailable || (isHotel && rooms.length === 0)}
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
        "w-full border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900",
        compact
          ? "mx-auto max-w-2xl rounded-t-2xl border-x border-t p-4 shadow-lg"
          : "rounded-2xl border p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] dark:shadow-black/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black tracking-tight">{formatPrice(total)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isDated && nights > 0
              ? `${nights} ${dayLabel}${nights > 1 ? "s" : ""}${isHotel && quantity > 1 ? ` × ${quantity} rooms` : ""} × ${formatPrice(unitPrice)} ${priceUnitLabel}`
              : isHotel && selectedRoom && quantity > 1
                ? `${quantity} rooms × ${formatPrice(unitPrice)} ${priceUnitLabel}`
                : priceUnitLabel}
          </p>
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
            {isDated ? (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="text-sm font-semibold">
                        {bookingKind === "car" ? "Pick date" : "Check-in"}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={submitting}
                              className={cn(
                                "mt-2 h-11 justify-start px-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {checkInDate ? (
                                format(checkInDate, "LLL dd, y")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkInDate}
                            disabled={{ before: today }}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                              const nextCheckOut = form.getValues("checkOut");
                              if (
                                date &&
                                nextCheckOut &&
                                new Date(`${nextCheckOut}T00:00:00`) <= startOfDay(date)
                              ) {
                                form.setValue("checkOut", "", { shouldValidate: true });
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="text-sm font-semibold">
                        {bookingKind === "car" ? "Return date" : "Check-out"}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={submitting}
                              className={cn(
                                "mt-2 h-11 justify-start px-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {checkOutDate ? (
                                format(checkOutDate, "LLL dd, y")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOutDate}
                            disabled={{ before: checkOutMinDate }}
                            onSelect={(date) =>
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}


            {isHotel ? (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="roomTypeId"
                  render={({ field }) => (
                    <FormItem className="flex min-w-0 flex-col">
                      <Label className="text-sm font-semibold">Room type</Label>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("roomCount", 1, { shouldValidate: true });
                        }}
                        disabled={submitting || rooms.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="mt-2 h-11 w-full">
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => {
                            const availability = availabilityByRoom.get(room.id);
                            const left =
                              checkIn && checkOut && nights > 0
                                ? (availability?.availableRooms ?? room.totalRooms)
                                : room.totalRooms;
                            return (
                              <SelectItem key={room.id} value={room.id} disabled={left <= 0}>
                                <span className="flex items-center gap-2">
                                  <BedDouble className="size-4 text-muted-foreground" />
                                  {room.name} · {formatPrice(room.price)} / night
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomCount"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <Label className="text-sm font-semibold">Number of rooms</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11 shrink-0"
                          disabled={submitting || quantity <= 1}
                          onClick={() =>
                            field.onChange(Math.max(quantity - 1, 1))
                          }
                          aria-label="Fewer rooms"
                        >
                          <Minus className="size-4" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={Math.max(maxRooms, 1)}
                            className="h-11 min-w-0 flex-1 px-1 text-center"
                            disabled={submitting || !selectedRoom}
                            {...field}
                            value={field.value ?? 1}
                            onChange={(event) => {
                              const next = Math.floor(Number(event.target.value));
                              field.onChange(
                                Number.isNaN(next)
                                  ? 1
                                  : Math.min(Math.max(next, 1), Math.max(maxRooms, 1)),
                              );
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11 shrink-0"
                          disabled={submitting || !selectedRoom || quantity >= maxRooms}
                          onClick={() =>
                            field.onChange(Math.min(quantity + 1, Math.max(maxRooms, 1)))
                          }
                          aria-label="More rooms"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      {selectedRoom && checkIn && checkOut && nights > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {maxRooms > 0
                            ? `${maxRooms} ${selectedRoom.name} room${maxRooms > 1 ? "s" : ""} available for these dates`
                            : `No ${selectedRoom.name} rooms left for these dates`}
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

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
                  {isDated && nights > 0 ? (
                    <>
                      Pay {formatPrice(total)} <ArrowRight className="size-4" />
                    </>
                  ) : isHotel && selectedRoom && quantity > 1 ? (
                    <>
                      Pay {formatPrice(total)} <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <>
                      Continue to payment <ArrowRight className="size-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
