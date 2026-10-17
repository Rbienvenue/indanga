"use client";

import type { House, RoomType } from "@/@types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Headphones, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import type { BookingPropertyCardBooking } from "@/components/bookings/booking-property-card";
import { ReportListingDialog } from "@/components/properties/report-listing-dialog";
import { BookingRequestStatus } from "@/components/bookings/booking-request-status";
import { usePropertyBooking } from "@/components/bookings/use-property-booking";
import { PolicyAcceptance } from "@/components/houses/booking-policy-acceptance";
import { HomeBookingFields } from "@/components/houses/home-booking-fields";
import { HotelBookingFields } from "@/components/houses/hotel-booking-fields";
import { BookingPriceSummary } from "@/components/houses/BookingPriceSummary";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { fetcher } from "@/lib/fetcher";
import { getBookingKind } from "@/lib/booking-kind";
import { calcServiceFee, type ServiceFee } from "@/lib/service-fee";
import { getDisplayPrice } from "@/lib/room-pricing";
import { cn, formatCurrency } from "@/lib/utils";

import {
  bookingSchema,
  purchaseSchema,
  BookingValues,
  datedBookingSchema,
  getNights,
  hotelBookingSchema,
} from "@/lib/validations/booking";
import { DatedBookingFields } from "./dated-booking-fields";

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
  hasAcceptedPolicy: boolean;
  onPolicyAcceptanceChange: (checked: boolean) => void;
  compact?: boolean;
}

export function BookingCard({
  house,
  isAvailable,
  onBook,
  hasAcceptedPolicy,
  onPolicyAcceptanceChange,
  compact = false,
}: BookingCardProps) {
  const [step, setStep] = useState<"booking" | "details">("booking");
  const [dismissedBookingId, setDismissedBookingId] = useState<string | null>(null);
  const bookingQuery = usePropertyBooking(house.id);
  const bookingRequest = bookingQuery.data?.data;
  const bookingKind = getBookingKind(house.propertyType);
  const isPurchase = house.listingPurpose === "SELL";
  const isDated = !isPurchase && (bookingKind === "hotel" || bookingKind === "car");
  const isHotel = !isPurchase && bookingKind === "hotel";
  const rooms = house.rooms ?? [];
  const { fromPrice } = getDisplayPrice(house.price, rooms);
  const form = useForm<BookingValues>({
    resolver: zodResolver(
      isPurchase
        ? purchaseSchema
        : isHotel
          ? hotelBookingSchema
          : isDated
            ? datedBookingSchema
            : bookingSchema,
    ),
    defaultValues: {
      houseId: house.id,
      months: isPurchase ? undefined : 1,
      checkIn: "",
      checkOut: "",
      roomTypeId: "",
      roomCount: 1,
      guestCount: 1,
    },
  });
  const checkIn = useWatch({ control: form.control, name: "checkIn" });
  const checkOut = useWatch({ control: form.control, name: "checkOut" });
  const roomTypeId = useWatch({ control: form.control, name: "roomTypeId" });
  const roomCount = useWatch({ control: form.control, name: "roomCount" });
  const months = useWatch({ control: form.control, name: "months" }) ?? 1;
  const validMonths = Number.isInteger(months) && months >= 1;
  const nights = isDated ? getNights(checkIn, checkOut) : 0;
  const selectedRoom = isHotel ? rooms.find((room) => room.id === roomTypeId) : undefined;
  const quantity = isHotel ? Math.max(Number(roomCount) || 1, 1) : 1;
  const unitPrice = Number(selectedRoom?.price ?? house.price ?? fromPrice ?? 0);
  const subtotal = isPurchase
    ? unitPrice
    : isHotel
      ? unitPrice * quantity * (nights > 0 ? nights : 1)
      : isDated && nights > 0
        ? unitPrice * nights
        : unitPrice * (bookingKind === "home" && validMonths ? months : 1);
  const serviceFeeQuery = useQuery({
    queryKey: ["service-fees", bookingKind],
    queryFn: () => fetcher<ApiResponse<ServiceFee>>(`/service-fees?bookingKind=${bookingKind}`),
    staleTime: 5 * 60 * 1000,
  });
  const serviceFeeConfig = serviceFeeQuery.data?.data;
  const serviceFee = calcServiceFee(subtotal, serviceFeeConfig, house.currency ?? "RWF");
  const cautionFee = isPurchase || isHotel ? 0 : Number(house.cautionFee ?? 0);
  const separateFee = serviceFeeConfig?.feeType === "fixed" && house.currency === "USD";
  const total = Math.round((subtotal + cautionFee + (separateFee ? 0 : serviceFee)) * 100) / 100;
  const priceReady =
    isPurchase || ((isDated ? nights > 0 : validMonths) && (!isHotel || Boolean(selectedRoom)));

  const availabilityQuery = useQuery({
    queryKey: ["properties", house.id, "availability", checkIn, checkOut],
    queryFn: () =>
      fetcher<ApiResponse<RoomAvailability[]>>(
        `/properties/${house.id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
      ),
    enabled: isHotel && step === "details" && Boolean(checkIn) && Boolean(checkOut) && nights > 0,
  });
  const availabilityByRoom = new Map(
    (availabilityQuery.data?.data ?? []).map((entry) => [entry.roomType.id, entry]),
  );
  const bookThisLabel = isPurchase
    ? "Buy now"
    : `Book this ${bookingKind === "hotel" ? "room" : bookingKind}`;
  const priceUnitLabel =
    bookingKind === "hotel" ? "per night" : bookingKind === "car" ? "per day" : "per month";

  const requestMutation = useMutation({
    mutationFn: ({
      months,
      houseId,
      checkIn,
      checkOut,
      roomTypeId,
      roomCount,
      guestCount,
    }: BookingValues) =>
      fetcher<ApiResponse<BookingPropertyCardBooking>>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          houseId,
          ...(!isPurchase ? (isDated ? { checkIn, checkOut } : { months }) : {}),
          ...(isHotel ? { roomTypeId, roomCount: Number(roomCount) || 1, guestCount } : {}),
        }),
      }),
    onSuccess: ({ data }) => {
      bookingQuery.saveBooking(data);
      setDismissedBookingId(null);
      setStep("booking");
      toast.success(
        isPurchase ? "Purchase request sent" : "Booking request sent — we've got you!",
        {
          description:
            "Providers usually respond within 30 minutes. We'll notify you here as soon as they do.",
          position: "top-center",
        },
      );
    },
    onError: (error) => {
      toast.error(
        isPurchase ? "Could not send purchase request" : "Could not send booking request",
        {
          description: error instanceof Error ? error.message : "Please try again.",
          position: "top-center",
        },
      );
    },
  });

  function beginCheckout() {
    if (onBook()) setStep("details");
  }

  const submitting = requestMutation.isPending;
  const { displayPrice: cardPrice, fromRooms } = getDisplayPrice(house.price, rooms);
  const currency = house.currency ?? "RWF";
  const cardPriceLabel =
    cardPrice != null ? (
      <>
        {fromRooms ? (
          <span className="mr-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            From
          </span>
        ) : null}
        {formatCurrency(cardPrice, currency)}
      </>
    ) : (
      "Contact for price"
    );

  if (bookingQuery.isLoading || bookingQuery.isError) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        {bookingQuery.isError ? (
          <Button variant="outline" onClick={() => void bookingQuery.refetch()}>
            Retry loading your booking
          </Button>
        ) : (
          <p className="flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading your booking…
          </p>
        )}
      </div>
    );
  }

  if (bookingRequest && bookingRequest.id !== dismissedBookingId) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <BookingRequestStatus
          booking={bookingRequest}
          onBookAgain={
            isDated
              ? () => {
                  setDismissedBookingId(bookingRequest.id);
                  setStep("booking");
                }
              : undefined
          }
        />
      </div>
    );
  }

  if (step === "booking") {
    if (compact) {
      return (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-5">
            <p className="text-lg font-black">{cardPriceLabel}</p>
            <Button
              className="h-12 min-w-40 px-6 font-bold"
              disabled={!isAvailable || !hasAcceptedPolicy || (isHotel && rooms.length === 0)}
              onClick={beginCheckout}
            >
              {isAvailable ? bookThisLabel : "Unavailable"}
            </Button>
          </div>
          <PolicyAcceptance
            isPurchase={isPurchase}
            id="mobile-policy-consent"
            checked={hasAcceptedPolicy}
            onCheckedChange={onPolicyAcceptanceChange}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-900/10 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
          {cardPrice != null ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-2xl font-black tracking-tight">
              {fromRooms ? (
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  From
                </span>
              ) : null}
              <span>{formatCurrency(cardPrice, currency)}</span>
              {!isPurchase && (
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  / {priceUnitLabel.replace("per ", "")}
                </span>
              )}
            </p>
          ) : (
            <p className="text-lg font-bold text-slate-500 dark:text-slate-400">
              Contact for price
            </p>
          )}
          <PolicyAcceptance
            isPurchase={isPurchase}
            id="desktop-policy-consent"
            checked={hasAcceptedPolicy}
            onCheckedChange={onPolicyAcceptanceChange}
          />
          <Button
            className="mt-4 h-12 w-full text-base font-bold"
            disabled={!isAvailable || !hasAcceptedPolicy}
            onClick={beginCheckout}
          >
            {isAvailable ? bookThisLabel : "Not available"}
          </Button>
        </div>
        <div className="rounded-xl border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Headphones className="size-6 shrink-0 text-primary" />
            <div className="text-[13px] leading-5">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Need help?</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-500 dark:text-slate-400">
                <a
                  href="mailto:support@indanga.com"
                  className="text-[13px] font-semibold text-primary hover:underline"
                >
                  support@indanga.com
                </a>
                <a
                  href="tel:+250788765547"
                  className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  +250 788 765 547
                </a>
              </p>
            </div>
          </div>
        </div>

        <ReportListingDialog houseId={house.id} />
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setStep("booking")}
        className="mb-3 -ml-2 gap-1.5 text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </Button>
      <BookingPriceSummary
        bookingKind={bookingKind}
        isPurchase={isPurchase}
        currency={currency}
        unitPrice={unitPrice}
        months={months}
        nights={nights}
        quantity={quantity}
        subtotal={subtotal}
        cautionFee={cautionFee}
        serviceFee={serviceFee}
        serviceFeeConfig={serviceFeeConfig}
        total={total}
        ready={priceReady}
      />

      <Form {...form}>
        <form
          data-slot="booking-form"
          onSubmit={form.handleSubmit((values) => {
            if (
              isHotel &&
              selectedRoom &&
              (values.guestCount ?? 1) > selectedRoom.capacity * quantity
            ) {
              form.setError("guestCount", {
                message: "Guest count exceeds the selected rooms’ capacity",
              });
              return;
            }
            requestMutation.mutate(values);
          })}
          className="mt-5 space-y-4"
        >
          {!isPurchase && bookingKind === "home" ? (
            <HomeBookingFields form={form} submitting={submitting} />
          ) : null}
          {isDated ? (
            <DatedBookingFields form={form} submitting={submitting} isCar={bookingKind === "car"} />
          ) : null}

          {isHotel ? (
            <HotelBookingFields
              form={form}
              rooms={rooms}
              submitting={submitting}
              currency={currency}
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              roomTypeId={roomTypeId}
              quantity={quantity}
              availabilityByRoom={availabilityByRoom}
            />
          ) : null}

          <Button type="submit" className="h-11 w-full font-bold" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Sending request...
              </>
            ) : (
              <>
                {isPurchase ? "Send purchase request" : "Send booking request"}{" "}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
