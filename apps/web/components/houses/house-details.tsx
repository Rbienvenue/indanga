"use client";

import type { House, RoomType } from "@/@types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  ChevronRight,
  Heart,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { BookingCard } from "@/components/houses/BookingCard";
import { Gallery } from "./property-gallery";
import { ListingInformation } from "./listing-information";
import { PropertyVerificationBadge } from "@/components/properties/property-verification-badge";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HouseDetailsSkeleton } from "./house-details-skeleton";
import { fetcher } from "@/lib/fetcher";
import { getBookingKind } from "@/lib/booking-kind";
import { amenityIcons, parseAmenities } from "@/lib/amenities";
import { propertyAmenityLabels } from "@/lib/validations/house";
import { cn, formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/home/footer";

function ActionButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Icon className={cn("size-4", active && "fill-rose-500 text-rose-500")} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function HouseDetails({ houseId }: { houseId: string }) {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);

  const houseQuery = useQuery<ApiResponse<House>>({
    queryKey: ["properties", houseId],
    queryFn: () => fetcher(`/properties/${houseId}`),
  });

  const favoriteMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<{ isFavorite: boolean }>>(`/properties/${houseId}/favorites`, {
        method: "POST",
      }),
    onSuccess: ({ data }) => {
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? "Saved to your favorites." : "Removed from your favorites.");
      void queryClient.invalidateQueries({ queryKey: ["properties", "favorites"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function requireAuthentication(): boolean {
    if (!session) {
      const callbackUrl = `/properties/${houseId}`;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return false;
    }

    return true;
  }

  function bookProperty(): boolean {
    if (!hasAcceptedPolicy) return false;
    return requireAuthentication();
  }

  async function shareHouse() {
    const shareData = {
      title: houseQuery.data?.data.name ?? "INDANGA home",
      text: "Take a look at this home on INDANGA.",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to your clipboard.");
  }

  if (houseQuery.isLoading) return <HouseDetailsSkeleton />;

  if (houseQuery.isError || !houseQuery.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 text-center dark:bg-slate-950">
        <div className="max-w-md">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-white shadow-sm dark:bg-slate-900">
            <Home className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">We could not find this home</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            It may no longer be listed, or there may be a temporary connection problem.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" asChild className="h-10 px-4">
              <Link href="/">Back home</Link>
            </Button>
            <Button className="h-10 px-4" onClick={() => houseQuery.refetch()}>
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const house = houseQuery.data.data;
  const rooms: RoomType[] = (house as House & { rooms?: RoomType[] }).rooms ?? [];
  const roomPrices = rooms.map((room) => room.price);
  const fromPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null;
  const isAvailable = house.status === "AVAILABLE";
  const bookingKind = getBookingKind(house.propertyType);
  const amenities = parseAmenities(house.metadata);
  const isSale = house.listingPurpose === "SELL";
  const detailCopy = isSale
    ? {
        spaceEyebrow: bookingKind === "car" ? "The vehicle" : "The space",
        spaceHeading: bookingKind === "car" ? "Your next vehicle" : "Your next home",
        whyHeading: "Explore this listing",
        firstTitle: "Available for sale",
        firstDescription:
          "The displayed price is the full asking price. Send a purchase request to the provider.",
        availabilityDescription:
          "The provider confirms availability before you pay for this property.",
      }
    : bookingKind === "car"
      ? {
          spaceEyebrow: "The vehicle",
          spaceHeading: "Ready for the road",
          whyHeading: "Designed for an easy rental",
          firstTitle: "Ready to drive away",
          firstDescription: `A ${house.propertyType.toLowerCase()} available for flexible rental, priced per day.`,
          availabilityDescription:
            "Availability is kept current so you know when a car is ready to book.",
        }
      : bookingKind === "hotel"
        ? {
            spaceEyebrow: "The stay",
            spaceHeading: "A place to rest easy",
            whyHeading: "Designed for an easy stay",
            firstTitle: "Ready for your stay",
            firstDescription: `A ${house.propertyType.toLowerCase()} listed for comfortable short stays, booked per night.`,
            availabilityDescription:
              "Availability is kept current so you know when a room is ready to book.",
          }
        : {
            spaceEyebrow: "The space",
            spaceHeading: "A place to settle into",
            whyHeading: "Designed for an easy move",
            firstTitle: "Ready to call home",
            firstDescription: `A ${house.propertyType.toLowerCase()} listed for long-term monthly living.`,
            availabilityDescription:
              "Availability is kept current so you know when a home is ready to book.",
          };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-900/8 bg-[#f7f5f0]/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="INDANGA home">
            <Image
              src="/logo.png"
              alt="INDANGA"
              width={32}
              height={32}
              className="size-8 rounded-lg bg-white object-contain shadow-xs"
            />
            <span className="text-lg font-black tracking-[0.12em] text-[#17174a] dark:text-slate-50">
              INDANGA
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ActionButton icon={Share2} label="Share" onClick={shareHouse} />
            <ActionButton
              icon={Heart}
              label={isFavorite ? "Saved" : "Save"}
              active={isFavorite}
              onClick={() => {
                if (requireAuthentication()) favoriteMutation.mutate();
              }}
            />
            {!session ? (
              <Button variant="outline" asChild className="ml-2 hidden h-10 px-5 md:inline-flex">
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent(`/properties/${houseId}`)}`}
                >
                  Sign in
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex items-center gap-2 py-5 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Explore Properties
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate">{house.propertyType}</span>
        </div>

        <Gallery house={house} />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_32rem] lg:gap-12">
          <div>
            <div className="flex flex-col gap-5 border-b border-slate-900/10 pb-8 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#17174a] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {house.propertyType}
                  </span>
                  <PropertyVerificationBadge
                    status={house.verificationStatus}
                    listingStatus={house.status}
                    lastReviewed={house.updatedAt}
                  />
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      isAvailable
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                    )}
                  >
                    {isAvailable ? "Available now" : "Currently booked"}
                  </span>
                </div>
                <h1 className="max-w-3xl text-3xl leading-tight font-black tracking-[-0.035em] sm:text-4xl">
                  {house.name}
                </h1>
                <p className="mt-4 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="size-4 text-primary" />
                  {house.address || house.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-900/10 border-b border-slate-900/10 py-7 dark:divide-white/10 dark:border-white/10">
              {house.bathrooms > 0 ? (
                <PropertyFact
                  icon={Bath}
                  value={house.bathrooms}
                  label={house.bathrooms === 1 ? "bathroom" : "bathrooms"}
                />
              ) : null}
              {house.bedrooms > 0 ? (
                <PropertyFact
                  icon={BedDouble}
                  value={house.bedrooms}
                  label={house.bedrooms === 1 ? "bedroom" : "bedrooms"}
                />
              ) : null}
              <PropertyFact icon={Building2} value={house.propertyType} label="property type" />
            </div>

            <section className="py-9">
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{detailCopy.spaceHeading}</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-400">
                {house.description}
              </p>
            </section>

            <Separator className="bg-slate-900/10 dark:bg-white/10" />

            {amenities.length > 0 ? (
              <>
                <section className="py-9">
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">What this place offers</h2>
                  <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    {amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <li key={amenity} className="flex items-center gap-4">
                          <Icon className="size-6 shrink-0 text-slate-950 dark:text-slate-50" />
                          <span className="text-base text-slate-800 dark:text-slate-200">
                            {propertyAmenityLabels[amenity]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <Separator className="bg-slate-900/10 dark:bg-white/10" />
              </>
            ) : null}

            {bookingKind === "hotel" && rooms.length > 0 ? (
              <>
                <section className="py-9">
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    Rooms
                    {fromPrice != null
                      ? ` · from ${formatCurrency(fromPrice, house.currency ?? "RWF")}`
                      : ""}
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {rooms.map((room) => (
                      <li
                        key={room.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/55 p-5"
                      >
                        <div>
                          <p className="font-bold">{room.name}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {room.totalRooms} {room.totalRooms === 1 ? "room" : "rooms"} available
                            in this category · Sleeps {room.capacity}
                          </p>
                        </div>
                        <p className="text-lg font-black text-primary">
                          {formatCurrency(room.price, house.currency ?? "RWF")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <Separator className="bg-slate-900/10 dark:bg-white/10" />
              </>
            ) : null}

            <section className="py-9">
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{detailCopy.whyHeading}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Feature
                  icon={KeyRound}
                  title={detailCopy.firstTitle}
                  description={detailCopy.firstDescription}
                />
                <Feature
                  icon={MapPin}
                  title="Convenient location"
                  description={`Set in ${house.location}, with the full address available for your visit.`}
                />
                <Feature
                  icon={ShieldCheck}
                  title="Clear availability"
                  description={detailCopy.availabilityDescription}
                />
                <Feature
                  icon={MessageCircle}
                  title="Support when needed"
                  description={
                    isSale
                      ? "INDANGA support can help with your purchase and handover."
                      : "Your booking stays connected to INDANGA from confirmation onward."
                  }
                />
              </div>
            </section>

            <Separator className="bg-slate-900/10 dark:bg-white/10" />

            <ListingInformation house={house} bookingKind={bookingKind} isAvailable={isAvailable} />
          </div>

          <aside className="sticky top-24 hidden has-[[data-slot=booking-form]]:static lg:block">
            <BookingCard
              house={house}
              isAvailable={isAvailable}
              onBook={bookProperty}
              hasAcceptedPolicy={hasAcceptedPolicy}
              onPolicyAcceptanceChange={setHasAcceptedPolicy}
            />
          </aside>
        </div>
      </main>

      <div className="pb-24 lg:pb-0">
        <Footer />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/10 bg-[#f7f5f0]/95 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
        <BookingCard
          house={house}
          isAvailable={isAvailable}
          onBook={bookProperty}
          hasAcceptedPolicy={hasAcceptedPolicy}
          onPolicyAcceptanceChange={setHasAcceptedPolicy}
          compact
        />
      </div>
    </div>
  );
}

function PropertyFact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BedDouble;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center px-3 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
      <Icon className="mb-2 size-5 text-primary sm:mb-0" />
      <div>
        <p className="text-sm font-bold capitalize sm:text-base">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card/55 p-5">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
