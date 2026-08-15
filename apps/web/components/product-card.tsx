"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, ChevronLeft, ChevronRight, Heart, MapPin, Pencil } from "lucide-react";

import type { ApiResponse } from "@/@types";
import { DeletePropertyDialog } from "@/components/dashboard/properties/delete-property-dialog";
import {
  PropertyStatusBadge,
  type PropertyStatus,
} from "@/components/properties/property-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { useSession } from "./providers/session-provider";

export type ProductCardProps = {
  id: string;
  name: string;
  location: string;
  price: number;
  media?: string[];
  bedrooms: number;
  bathrooms: number;
  description?: string;
  address?: string | null;
  propertyType?: string;
  badge?: string;
  badgeClassName?: string;
  href?: string;
  priceUnit?: string;
  className?: string;
  isFavorite?: boolean;
  showManageActions?: boolean;
  status?: PropertyStatus;
};

function formatPrice(price: number) {
  return `$${price.toLocaleString()}`;
}

export function ProductCard({
  id,
  name,
  location,
  price,
  media,
  bedrooms,
  bathrooms,
  description = "",
  address,
  propertyType = "House",
  badge,
  badgeClassName = "bg-primary text-primary-foreground",
  href,
  priceUnit = "/ month",
  className,
  isFavorite = false,
  showManageActions = false,
  status,
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const session = useSession();
  const isLoggedIn = !!session?.user;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = media && media.length > 0 ? media : ["/image2.jpeg"];
  const hasMultipleImages = images.length > 1;

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    },
    [images.length],
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    },
    [images.length],
  );

  const goToSlide = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  }, []);

  const favoriteMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<{ isFavorite: boolean }>>(`/properties/${id}/favorites`, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties", "favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
  });
  const favoriteState = favoriteMutation.data?.data.isFavorite ?? isFavorite;

  const card = (
    <Card
      key={id}
      className={cn(
        "group relative h-full w-full gap-0 overflow-hidden border-border/50 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5",
        className,
      )}
    >
      {href && (
        <Link
          href={href}
          aria-label={`View ${name}`}
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      )}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCurrentIndex(0);
        }}
      >
        {/* Image slider track */}
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
          }}
        >
          {images.map((src, index) => (
            <div
              key={src + index}
              className="relative h-full"
              style={{ width: `${100 / images.length}%` }}
            >
              <Image
                src={src}
                alt={`${name} - image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows — visible on hover when multiple images */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goToPrev}
              className={cn(
                "absolute left-2 top-1/2 z-10 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-foreground",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none",
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goToNext}
              className={cn(
                "absolute right-2 top-1/2 z-10 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-foreground",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none",
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultipleImages && (
          <div
            className={cn(
              "absolute bottom-2 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm transition-opacity",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={(e) => goToSlide(e, index)}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        )}

        {badge && (
          <Badge
            className={cn(
              "absolute top-3 left-3 z-10 rounded-md px-2.5 py-1 text-xs font-semibold shadow-md",
              badgeClassName,
            )}
          >
            {badge}
          </Badge>
        )}
        {showManageActions ? (
          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
            <Button variant="outline" size="icon" className="size-8" asChild>
              <Link href={`/dashboard/properties/new?propertyId=${id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <DeletePropertyDialog houseId={id} houseName={name} />
          </div>
        ) : (
          <button
            type="button"
            aria-label={favoriteState ? "Remove from favorites" : "Add to favorites"}
            disabled={favoriteMutation.isPending || !isLoggedIn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              favoriteMutation.mutate();
            }}
            className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart className={cn("size-4", favoriteState && "fill-red-500 text-red-500")} />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
            <span className="text-sm text-muted-foreground">{priceUnit}</span>
          </div>
          {status && <PropertyStatusBadge status={status} />}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
          {bedrooms > 0 && <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BedDouble className="size-3.5" />
            {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
          </div>}
          {bathrooms > 0 && <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bath className="size-3.5" />
            {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
          </div>}
        </div>
      </CardContent>
    </Card>
  );

  return card;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-3 border-t border-border/50 pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
