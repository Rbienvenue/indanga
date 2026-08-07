"use client";

import type { House } from "@indanga/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

const PAGE_SIZE = 6;

type BookingWithHouse = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  house: House;
  client: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function EmptyBookings({ isAgent }: { isAgent: boolean }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">
        {isAgent ? "No booking requests yet" : "No bookings yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isAgent
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

function BookingStatusAction({
  bookingId,
}: {
  bookingId: string;
}) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetcher<ApiResponse<unknown>>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Booking status updated");
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update booking");
    },
  });

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-green-600 hover:bg-green-50 hover:text-green-700"
        disabled={statusMutation.isPending}
        onClick={() => statusMutation.mutate("APPROVED")}
      >
        {statusMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={statusMutation.isPending}
        onClick={() => statusMutation.mutate("REJECTED")}
      >
        {statusMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
        Reject
      </Button>
    </div>
  );
}

function AgentBookingCard({ booking }: { booking: BookingWithHouse }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {booking.client.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {booking.client.email}
            </p>
          </div>
        </div>

        <div className="text-sm">
          <Link
            href={`/houses/${booking.house.id}`}
            className="font-medium hover:underline"
          >
            {booking.house.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {booking.house.location}
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          ${booking.house.price.toLocaleString()}/mo
        </div>

        <div className="text-xs text-muted-foreground">
          {new Date(booking.createdAt).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={statusColors[booking.status]}>
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </Badge>
          {booking.status === "PENDING" && (
            <BookingStatusAction bookingId={booking.id} />
          )}
        </div>
      </CardContent>
    </Card>
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
  const session = useSession();
  const isAgent = session?.user?.role === "LANDLORD";

  const bookingsQuery = useQuery<PaginationResponse<BookingWithHouse>>({
    queryKey: ["bookings", page, PAGE_SIZE],
    queryFn: () => fetcher(`/bookings?page=${page}&limit=${PAGE_SIZE}`),
  });

  const bookings = bookingsQuery.data?.data ?? [];
  const meta = bookingsQuery.data?.meta;

  return (
    <main>
      <section className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAgent ? "Booking Requests" : "My Bookings"}
            </h1>
            <p className="text-muted-foreground">
              {isAgent
                ? "Manage booking requests from tenants."
                : "Houses you have booked."}
            </p>
          </div>
        </div>

        {!isAgent && (
          <Button asChild>
            <Link href="/">Explore Listings</Link>
          </Button>
        )}
      </section>

      {bookingsQuery.isLoading ? (
        isAgent ? (
          <section className="mt-6 space-y-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="size-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/4 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
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
        <EmptyBookings isAgent={isAgent} />
      ) : isAgent ? (
        <>
          <section className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <AgentBookingCard key={booking.id} booking={booking} />
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
      ) : (
        <>
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map(({ id, house }) => (
              <ProductCard
                key={id}
                id={house.id}
                href={`/houses/${house.id}`}
                name={house.name}
                location={house.location}
                price={house.price}
                media={house.media}
                bedrooms={house.bedrooms}
                bathrooms={house.bathrooms}
                badge={house.propertyType}
              />
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
    </main>
  );
}
