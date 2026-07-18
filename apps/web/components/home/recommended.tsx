"use client";

import type { House } from "@indanga/db";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { PaginationResponse } from "@/@types";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { fetcher } from "@/lib/fetcher";


export function Recommended() {
  const { data, isLoading, isError } = useQuery<PaginationResponse<House>>({
    queryKey: ["houses", "recommended"],
    queryFn: () => fetcher("/houses?limit=6&type=featured"),
  });

  const houses = data?.data ?? [];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recommended For You
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">
            Could not load recommended houses. Please try again later.
          </p>
        ) : houses.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No recommended houses available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <ProductCard
                key={house.id}
                id={house.id}
                name={house.name}
                location={house.location}
                price={house.price}
                media={house.media}
                bedrooms={house.bedrooms}
                bathrooms={house.bathrooms}
                badge="Featured"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
