"use client";

import type { House } from "@indanga/db";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import { useState } from "react";

import type { PaginationResponse } from "@/@types";
import {
  type PropertySearchValues,
  SearchBar,
} from "@/components/home/search-bar";
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

function buildHousesUrl(page: number, filters: PropertySearchValues) {
  const params = new URLSearchParams({
    page: String(page),
    limit:"20",
    status: "AVAILABLE",
  });

  if (filters.location !== "all") params.set("location", filters.location);
  if (filters.propertyType !== "all") {
    params.set("propertyType", filters.propertyType);
  }

  if (filters.budget !== "any") {
    const { minPrice, maxPrice } = getBudgetRange(filters.budget);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
  }

  return `/houses?${params.toString()}`;
}

type PropertyFeedProps = {
  initialFilters: PropertySearchValues;
};

export function PropertyFeed({ initialFilters }: PropertyFeedProps) {
  const [filters, setFilters] = useState(initialFilters);
  const housesQuery = useInfiniteQuery({
    queryKey: ["houses", "feed", filters],
    queryFn: ({ pageParam }) =>
      fetcher<PaginationResponse<House>>(buildHousesUrl(pageParam, filters)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  });

  const houses = housesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = housesQuery.data?.pages[0]?.meta.total;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Properties for rent
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse available homes across Rwanda.
            </p>
          </div>
        </div>
      </div>

      <SearchBar
        className="mt-0 px-0"
        defaultValues={filters}
        onSearch={setFilters}
      />

      {housesQuery.isLoading ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 20 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      ) : housesQuery.isError ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load properties. Please try again.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => void housesQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : houses.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Home className="size-8" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No properties found</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try changing the location, property type, or budget.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <ProductCard
                key={house.id}
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

          {housesQuery.hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                disabled={housesQuery.isFetchingNextPage}
                onClick={() => void housesQuery.fetchNextPage()}
              >
                {housesQuery.isFetchingNextPage
                  ? "Loading properties..."
                  : "Load more properties"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
