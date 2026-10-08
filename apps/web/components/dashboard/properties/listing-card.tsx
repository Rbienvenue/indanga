"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PropertyStatusBadge } from "@/components/properties/property-status-badge";
import { PropertyVerificationBadge } from "@/components/properties/property-verification-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingKind, getPriceUnit, type HouseWithRooms } from "@/lib/booking-kind";
import { firstImageUrl } from "@/lib/property-media";
import { getDisplayPrice } from "@/lib/room-pricing";
import { formatPrice } from "@/lib/utils";
import { DeletePropertyDialog } from "./delete-property-dialog";

export function ListingCard({
  listing,
  selected,
  onSelect,
}: {
  listing: HouseWithRooms;
  selected: boolean;
  onSelect: () => void;
}) {
  const { displayPrice, fromRooms } = getDisplayPrice(listing.price, listing.rooms);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/50 ${selected ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <Image
        src={firstImageUrl(listing.media)}
        alt={listing.name}
        width={64}
        height={64}
        sizes="64px"
        className="size-16 shrink-0 rounded-md object-contain"
      />
      <div className="min-w-0 flex-1 break-words">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{listing.name}</p>
          <PropertyStatusBadge status={listing.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {listing.location} · {listing.propertyType}
        </p>
        <p className="mt-2 text-sm">
          {displayPrice != null
            ? `${fromRooms ? "From " : ""}${formatPrice(displayPrice)} ${getPriceUnit(listing.propertyType)}`
            : "Contact for price"}
        </p>
      </div>
    </button>
  );
}

export function ListingDetails({ listing }: { listing: HouseWithRooms }) {
  const isCar = getBookingKind(listing.propertyType) === "car";
  const { displayPrice, fromRooms } = getDisplayPrice(listing.price, listing.rooms);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Listing details</CardTitle>
        <p className="text-sm text-muted-foreground">{listing.propertyType}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Link href={`/properties/${listing.id}`} className="font-semibold hover:underline">
            {listing.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{listing.location}</p>
          {listing.address ? (
            <p className="mt-1 text-sm text-muted-foreground">{listing.address}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PropertyStatusBadge status={listing.status} />
          <PropertyVerificationBadge status={listing.verificationStatus} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="mt-1 font-medium">
              {displayPrice != null
                ? `${fromRooms ? "From " : ""}${formatPrice(displayPrice)} ${getPriceUnit(listing.propertyType)}`
                : "Contact for price"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Listed on</dt>
            <dd className="mt-1 font-medium">{new Date(listing.createdAt).toLocaleDateString()}</dd>
          </div>
          {!isCar ? (
            <>
              <div>
                <dt className="text-muted-foreground">Bedrooms</dt>
                <dd className="mt-1 font-medium">{listing.bedrooms}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bathrooms</dt>
                <dd className="mt-1 font-medium">{listing.bathrooms}</dd>
              </div>
            </>
          ) : null}
        </dl>
        {listing.rooms?.length ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">Room types</p>
            {listing.rooms.map((room) => (
              <div key={room.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {room.name} · {room.totalRooms} room(s)
                </span>
                <span className="text-muted-foreground">{formatPrice(room.price)} / night</span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="whitespace-pre-line break-words text-sm text-muted-foreground">
          {listing.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/dashboard/properties/new?propertyId=${listing.id}`}>
              <Pencil /> Edit listing
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/properties/${listing.id}`}>View listing</Link>
          </Button>
          <DeletePropertyDialog houseId={listing.id} houseName={listing.name} />
        </div>
      </CardContent>
    </Card>
  );
}
