"use client";

import type { BookingStatus, House } from "@indanga/db";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { PaginationResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { BookingCard, BookingDetails, type Booking } from "@/components/bookings/booking-card";
import { BookingPropertyCard } from "@/components/bookings/booking-property-card";
import { ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetcher } from "@/lib/fetcher";

const PAGE_SIZE = 6;
const bookingFilters = [
  { value: "all", label: "All" },
  { value: "REQUESTED", label: "New" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "CONFIRMED", label: "Confirmed" },
] as const satisfies readonly { value: BookingStatus | "all"; label: string }[];
type BookingFilter = (typeof bookingFilters)[number]["value"];

type BookingWithHouse = Booking & {
  paymentDeadline?: string | null;
  createdAt: string;
  nights?: number | null;
  unitPrice?: number | null;
  roomType: { id: string; name: string; price: number } | null;
  house: House;
  client: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

function EmptyBookings({ isAgent, filtered }: { isAgent: boolean; filtered: boolean }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">
        {filtered
          ? "No bookings with this status"
          : isAgent
            ? "No booking requests yet"
            : "No bookings yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Choose another status or All to see your other bookings."
          : isAgent
            ? "Booking requests from tenants will appear here."
            : "Houses you book will appear here."}
      </p>
      {!isAgent && (
        <Button asChild className="mt-6">
          <Link href="/">Explore listings</Link>
        </Button>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Bookings pagination"
      className="mt-6 flex items-center justify-between border-t pt-5"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingFilter>("all");
  const [selectedId, setSelectedId] = useState<string>();
  const session = useSession();
  const isAgent = session?.user?.role === "landlord";

  const bookingsQuery = useQuery<PaginationResponse<BookingWithHouse>>({
    queryKey: ["bookings", page, PAGE_SIZE, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status !== "all") params.set("status", status);
      return fetcher(`/bookings?${params}`);
    },
  });

  const bookings = bookingsQuery.data?.data ?? [];
  const meta = bookingsQuery.data?.meta;
  const selectedBooking = bookings.find((booking) => booking.id === selectedId) ?? bookings[0];

  return (
    <main>
      <section className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAgent ? "Bookings" : "My Bookings"}
            </h1>
            <p className="text-muted-foreground">
              {isAgent ? "Bookings from tenants." : "Properties you have booked."}
            </p>
          </div>
        </div>

        {!isAgent && (
          <Button asChild>
            <Link href="/">Explore Listings</Link>
          </Button>
        )}
      </section>

      <Tabs
        className="mt-6"
        value={status}
        onValueChange={(value) => {
          const filter = bookingFilters.find((item) => item.value === value);
          if (!filter) return;
          setStatus(filter.value);
          setPage(1);
          setSelectedId(undefined);
        }}
      >
        <TabsList aria-label="Filter bookings by status" className="h-auto max-w-full flex-wrap">
          {bookingFilters.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status}>
          {bookingsQuery.isLoading ? (
            isAgent ? (
              <section className="mt-6 space-y-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
              </section>
            ) : (
              <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </section>
            )
          ) : bookingsQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Could not load your bookings. Please try again.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => void bookingsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <EmptyBookings isAgent={isAgent} filtered={status !== "all"} />
          ) : isAgent ? (
            <>
              <section className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      selected={selectedBooking?.id === booking.id}
                      onSelect={() => setSelectedId(booking.id)}
                    />
                  ))}
                  {meta && (
                    <Pagination
                      page={meta.page}
                      totalPages={meta.totalPages}
                      isFetching={bookingsQuery.isFetching}
                      onPageChange={setPage}
                    />
                  )}
                </div>
                <BookingDetails
                  key={selectedBooking?.id}
                  booking={selectedBooking}
                  isCar={session?.user?.providerType === "CAR"}
                />
              </section>
            </>
          ) : (
            <>
              <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {bookings.map((booking) => (
                  <BookingPropertyCard key={booking.id} booking={booking} />
                ))}
              </section>
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  isFetching={bookingsQuery.isFetching}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
