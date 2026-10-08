"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BedDouble, CalendarCheck, CarFront, Clock3, Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { BookingStatus, ProviderType } from "@indanga/db";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "./stat-card";

type AgentStats = {
  totalProperties: number;
  availableListings: number;
  activeBookings: number;
  newRequests: number;
  bookingsToday: number;
  pendingPayment: number;
};

type Booking = {
  id: string;
  bookingId: string | null;
  status: BookingStatus;
  checkIn: string | null;
  checkOut: string | null;
  totalAmount: number | null;
  roomCount: number | null;
  roomType: { name: string } | null;
  house: { id: string; name: string; location: string };
  client: { name: string; email: string };
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function BookingRequestActions({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: "AWAITING_PAYMENT" | "DECLINED") =>
      fetcher(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Booking request updated");
      void queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex gap-2">
      <Button disabled={mutation.isPending} onClick={() => mutation.mutate("AWAITING_PAYMENT")}>
        Accept request
      </Button>
      <Button
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("DECLINED")}
      >
        Decline
      </Button>
    </div>
  );
}

function BookingDetails({ booking, isCar }: { booking?: Booking; isCar: boolean }) {
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
                  {booking.totalAmount != null ? formatPrice(booking.totalAmount) : "—"}
                </dd>
              </div>
            </dl>
            <p className="break-all rounded-lg bg-muted p-3 text-sm">{booking.client.email}</p>
            <Badge variant="secondary">{booking.status.replaceAll("_", " ")}</Badge>
            {booking.status === "REQUESTED" ? (
              <BookingRequestActions bookingId={booking.id} />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Choose a booking to review its details.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AgentDashboard({
  firstName,
  providerType,
}: {
  firstName: string;
  providerType: ProviderType;
}) {
  const isCar = providerType === "CAR";
  const isHouse = providerType === "HOUSE";
  const [selectedId, setSelectedId] = useState<string>();
  const statsQuery = useQuery<ApiResponse<AgentStats>>({
    queryKey: ["agent-stats"],
    queryFn: () => fetcher("/properties/stats"),
  });
  const bookingsQuery = useQuery<PaginationResponse<Booking>>({
    queryKey: ["recent-bookings"],
    queryFn: () => fetcher("/bookings?page=1&limit=5"),
  });
  const stats = statsQuery.data?.data;
  const bookings = bookingsQuery.data?.data ?? [];
  const selectedBooking = bookings.find((booking) => booking.id === selectedId) ?? bookings[0];
  const cards = [
    { title: "New requests", value: stats?.newRequests, icon: BedDouble },
    {
      title: isCar ? "Active rentals" : "Confirmed bookings",
      value: stats?.activeBookings,
      icon: CalendarCheck,
    },
    {
      title: isHouse ? "Published houses" : isCar ? "Pickups today" : "Arrivals today",
      value: isHouse ? stats?.availableListings : stats?.bookingsToday,
      icon: Clock3,
    },
    { title: "Pending payment", value: stats?.pendingPayment, icon: WalletCards },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            {isHouse ? "House provider" : isCar ? "Car provider" : "Hotel provider"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isHouse
              ? "Manage houses, booking requests, and rentals."
              : isCar
                ? "Manage vehicles, rentals, and upcoming pickups."
                : "Manage requests, bookings, and guest arrivals."}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus />
            {isHouse ? "Add house" : isCar ? "Add vehicle" : "Add hotel"}
          </Link>
        </Button>
      </div>
      {statsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load dashboard totals.{" "}
          <button className="underline" onClick={() => void statsQuery.refetch()}>
            Retry
          </button>
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) =>
            statsQuery.isLoading ? (
              <Skeleton key={card.title} className="h-24 rounded-xl" />
            ) : (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value ?? 0}
                icon={<card.icon className="size-5" />}
              />
            ),
          )}
        </section>
      )}
      {isCar && stats ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fleet overview</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/search">View vehicles</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <CarFront className="size-6 text-primary" />
            <p>
              <span className="font-semibold">{stats.availableListings}</span> published vehicles ·{" "}
              <span className="font-semibold">{stats.totalProperties}</span> total vehicles
            </p>
          </CardContent>
        </Card>
      ) : null}
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent bookings</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingsQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : bookingsQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                Unable to load bookings.{" "}
                <button className="underline" onClick={() => void bookingsQuery.refetch()}>
                  Retry
                </button>
              </p>
            ) : bookings.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No booking requests yet. Customer requests will appear here.
              </p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`rounded-lg border hover:bg-muted/50 ${selectedBooking?.id === booking.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <button
                    type="button"
                    aria-pressed={selectedBooking?.id === booking.id}
                    onClick={() => setSelectedId(booking.id)}
                    className="w-full rounded-lg p-4 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{booking.house.name}</p>
                      <Badge variant="secondary">{booking.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.client.name} · {booking.bookingId ?? "Booking request"}
                    </p>
                    {booking.checkIn && booking.checkOut ? (
                      <p className="mt-2 text-sm">
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      </p>
                    ) : null}
                  </button>
                  {booking.status === "REQUESTED" ? (
                    <div className="px-4 pb-4">
                      <BookingRequestActions bookingId={booking.id} />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <BookingDetails key={selectedBooking?.id} booking={selectedBooking} isCar={isCar} />
      </section>
    </div>
  );
}
