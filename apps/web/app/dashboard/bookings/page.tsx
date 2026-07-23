"use client";

import type { House } from "@indanga/db";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { PaginationResponse } from "@/@types";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";

const PAGE_SIZE = 6;

type BookingWithHouse = {
  id: string;
  house: House;
};

function EmptyBookings() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No bookings yet</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Houses you book will appear here.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Explore listings</Link>
      </Button>
    </div>
  );
}

export default function BookingsPage() {
  const [page, setPage] = useState(1);
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
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">Houses you have booked.</p>
          </div>
        </div>

        <Button asChild>
          <Link href="/">Explore Listings</Link>
        </Button>
      </section>

      {bookingsQuery.isLoading ? (
        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      ) : bookingsQuery.isError ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load your bookings. Please try again.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void bookingsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
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

          {meta && meta.totalPages > 1 ? (
            <nav
              aria-label="Bookings pagination"
              className="mt-6 flex items-center justify-between border-t pt-5"
            >
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || bookingsQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === meta.totalPages || bookingsQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}
