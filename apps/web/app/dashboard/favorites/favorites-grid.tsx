"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

type Favorite =
  | {
      id: string;
      type: "property";
      data: Record<string, any>;
    }
  | {
      id: string;
      type: "hotel";
      data: Record<string, any>;
    }
  | {
      id: string;
      type: "car";
      data: Record<string, any>;
    };

interface FavoritesGridProps {
  favorites: Favorite[];
  activeTab: string;
}

function EmptyFavorites() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Heart className="size-8" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No favorites yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Save properties, hotel rooms, or cars and they will show up here for quick access.
      </p>
      <Button asChild className="mt-6">
        <Link href="/houses">Explore Listings</Link>
      </Button>
    </div>
  );
}

function getProductCardProps(favorite: Favorite) {
  const data = favorite.data ?? {};

  const title = data.title ?? data.name ?? data.model ?? "Untitled";
  const location = data.location ?? data.address ?? data.city ?? "Location not added";
  const price = Number(data.price ?? data.rate ?? data.amount ?? 0);
  const media = Array.isArray(data.media)
    ? data.media
    : Array.isArray(data.images)
      ? data.images
      : [data.image ?? "/image2.jpeg"];
  const bedrooms = Number(data.bedrooms ?? data.rooms ?? 0);
  const bathrooms = Number(data.bathrooms ?? data.baths ?? 0);

  return {
    id: favorite.id,
    name: title,
    location,
    price,
    media,
    bedrooms,
    bathrooms,
    badge: favorite.type === "property" ? "Property" : favorite.type === "hotel" ? "Hotel" : "Car",
    href: data.href,
  };
}

export function FavoritesGrid({ favorites, activeTab }: FavoritesGridProps) {
  const visibleFavorites = favorites.filter((favorite) => {
    if (activeTab === "all") return true;
    if (activeTab === "properties") return favorite.type === "property";
    if (activeTab === "hotels") return favorite.type === "hotel";
    if (activeTab === "cars") return favorite.type === "car";
    return true;
  });

  if (!visibleFavorites.length) {
    return <EmptyFavorites />;
  }

  return (
    <section className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {visibleFavorites.map((favorite) => (
        <ProductCard
          key={favorite.id}
          {...getProductCardProps(favorite)}
        />
      ))}
    </section>
  );
}