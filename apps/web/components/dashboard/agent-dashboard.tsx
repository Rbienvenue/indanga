"use client";

import { useQuery } from "@tanstack/react-query";
import { BedDouble, CalendarCheck, CarFront, Clock3, Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ProviderType } from "@indanga/db";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { BookingCard, BookingDetails, type Booking } from "@/components/bookings/booking-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { StatCard } from "./stat-card";

type AgentStats = {
  totalProperties: number;
  availableListings: number;
  activeBookings: number;
  newRequests: number;
  bookingsToday: number;
  pendingPayment: number;
};

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
            {isHouse ? "Add house" : isCar ? "Add vehicle" : "Add listing"}
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
              <Link href="/dashboard/listings">View vehicles</Link>
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
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  selected={selectedBooking?.id === booking.id}
                  onSelect={() => setSelectedId(booking.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
        <BookingDetails key={selectedBooking?.id} booking={selectedBooking} isCar={isCar} />
      </section>
    </div>
  );
}
