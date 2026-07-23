"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { House } from "@indanga/db";

import type { PaginationResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "../product-card";
import { fetcher } from "@/lib/fetcher";

export function ContinueBrowsing() {
    const { data, isLoading, isError } = useQuery<PaginationResponse<House>>({
        queryKey: ["houses", "continue-browsing"],
        queryFn: () => fetcher("/houses?limit=6"),
    });

    const houses = data?.data ?? [];

    if (isError) {
        return null;
    }

    return (
        <section className="w-full space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Continue Browsing
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Pick up where you left off.
                    </p>
                </div>

                <Button asChild variant="ghost">
                    <Link href="/houses">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : houses.length === 0 ? null : (
                <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                            badge="Featured"
                          
                        />
                    ))}
                </div>
            )}
        </section>
    );
}