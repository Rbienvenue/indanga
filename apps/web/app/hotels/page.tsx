"use client";

import type { House } from "@indanga/db";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Building2, Compass, Sparkles } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import type { PaginationResponse } from "@/@types";
import { SearchBar } from "@/components/home/search-bar";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";

function getBudgetRange(budget: string) {
  const [minimum, maximum] = budget.split("-");

  return {
    minPrice: minimum && minimum !== "0" ? minimum : undefined,
    maxPrice: maximum || undefined,
  };
}

function buildHotelsUrl(page: number, filters: { propertyType: string; budget: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
    status: "AVAILABLE",
  });

  if (filters.propertyType !== "all") {
    params.set("propertyType", filters.propertyType);
  }

  if (filters.budget !== "any") {
    const { minPrice, maxPrice } = getBudgetRange(filters.budget);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
  }

  return `/properties?${params.toString()}`;
}

export default function HotelsPage() {
  const [propertyType] = useQueryState("type", parseAsString.withDefault("all"));
  const [budget] = useQueryState("budget", parseAsString.withDefault("any"));

  const filters = { propertyType, budget };

  const hotelsQuery = useInfiniteQuery({
    queryKey: ["hotels", filters],
    queryFn: ({ pageParam }) =>
      fetcher<PaginationResponse<House>>(buildHotelsUrl(pageParam, filters)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });

  const hotels = hotelsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-background to-background p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Building2 className="size-4" />
              Hotel rooms & stays
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Discover comfortable rooms and book your next stay in minutes.
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Browse premium hotel rooms, compare amenities, and reserve the perfect stay for
              business trips, weekend escapes, or family visits.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Instant booking-ready listings
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Every room card opens a full details page so guests can review space, amenities, and
              make a reservation.
            </p>
          </div>
        </div>
      </section>

      <SearchBar className="mt-8 px-0" />

      {hotelsQuery.isLoading ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      ) : hotelsQuery.isError ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn't load the available hotels right now. Please try again.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void hotelsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : hotels.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-8" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No hotel rooms found</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try changing the type or budget to find another stay.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <ProductCard
                key={hotel.id}
                id={hotel.id}
                href={`#`}
                name={hotel.name}
                location={hotel.location}
                price={hotel.price}
                media={hotel.media}
                bedrooms={hotel.bedrooms}
                bathrooms={hotel.bathrooms}
                badge="Hotel room"
              />
            ))}
          </section>

          {hotelsQuery.hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                disabled={hotelsQuery.isFetchingNextPage}
                onClick={() => void hotelsQuery.fetchNextPage()}
              >
                {hotelsQuery.isFetchingNextPage ? "Loading rooms..." : "Load more rooms"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
