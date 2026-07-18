import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Heart, MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProductCardProps = {
  id: string;
  name: string;
  location: string;
  price: number;
  media?: string[];
  bedrooms: number;
  bathrooms: number;
  badge?: string;
  badgeClassName?: string;
  href?: string;
  priceUnit?: string;
  className?: string;
  onFavoriteClick?: () => void;
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
  badge,
  badgeClassName = "bg-primary text-primary-foreground",
  href,
  priceUnit = "/ month",
  className,
  onFavoriteClick,
}: ProductCardProps) {
  const imageSrc = media?.[0] || "/image2.jpeg";
  const card = (
    <Card
      key={id}
      className={cn(
        "group overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {badge && (
          <Badge
            className={cn(
              "absolute top-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold shadow-md",
              badgeClassName,
            )}
          >
            {badge}
          </Badge>
        )}
        <button
          type="button"
          aria-label="Add to favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteClick?.();
          }}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
        >
          <Heart className="size-4" />
        </button>
      </div>

      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
          <span className="text-sm text-muted-foreground">{priceUnit}</span>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BedDouble className="size-3.5" />
            {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bath className="size-3.5" />
            {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
      {card}
    </Link>
  );
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
