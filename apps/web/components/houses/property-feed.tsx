"use client";

import type { House } from "@indanga/db";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import type { PaginationResponse } from "@/@types";
import { SearchBar } from "@/components/home/search-bar";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { buildPropertiesUrl } from "@/lib/property-filters";

export function PropertyFeed({ ownerId }: { ownerId?: string } = {}) {
  const [propertyType] = useQueryState("type", parseAsString.withDefault("all"));
  const [subType] = useQueryState("subType", parseAsString.withDefault("all"));
  const [budget] = useQueryState("budget", parseAsString.withDefault("any"));

  const filters = { propertyType, subType, budget };
  const status = ownerId ? null : "AVAILABLE";

  const housesQuery = useInfiniteQuery({
    queryKey: ["properties", "feed", filters, ownerId, status],
    queryFn: ({ pageParam }) => {
      const url = buildPropertiesUrl(pageParam, filters, { status });
      const separator = url.includes("?") ? "&" : "?";
      const ownerParam = ownerId ? `${separator}ownerId=${ownerId}` : "";
      return fetcher<PaginationResponse<House>>(`${url}${ownerParam}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });

  const houses = housesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <SearchBar className="mt-0 px-0" />

      {housesQuery.isLoading ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 20 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      ) : housesQuery.isError ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load properties. Please try again.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void housesQuery.refetch()}>
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
            Try changing the property type or budget.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {houses.map((house) => (
              <ProductCard
                key={house.id}
                id={house.id}
                href={`/properties/${house.id}`}
                name={house.name}
                location={house.location}
                price={house.price}
                media={house.media}
                bedrooms={house.bedrooms}
                bathrooms={house.bathrooms}
                description={house.description}
                address={house.address}
                propertyType={house.propertyType}
                badge={house.propertyType}
                showManageActions={!!ownerId}
                status={ownerId ? house.status : undefined}
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
                {housesQuery.isFetchingNextPage ? "Loading properties..." : "Load more properties"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
