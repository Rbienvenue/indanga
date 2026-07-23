"use client";

import type { House } from "@indanga/db";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";

export type FavoriteWithHouse = {
  id: string;
  houseId: string;
  userId: string;
  createdAt: string;
  house: House;
};

interface FavoritesGridProps {
  favorites: FavoriteWithHouse[];
  isLoading: boolean;
  isError: boolean;
}

function EmptyFavorites() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Heart className="size-8" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No favorites yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Save houses you like and they will show up here for quick access.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Explore Listings</Link>
      </Button>
    </div>
  );
}

export function FavoritesGrid({ favorites, isLoading, isError }: FavoritesGridProps) {
  if (isLoading) {
    return (
      <section className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <p className="mt-10 text-center text-sm text-muted-foreground">
        Could not load your favorites. Please try again later.
      </p>
    );
  }

  if (!favorites.length) {
    return <EmptyFavorites />;
  }

  return (
    <section className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {favorites.map(({ id, house }) => (
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
          isFavorite
        />
      ))}
    </section>
  );
}
