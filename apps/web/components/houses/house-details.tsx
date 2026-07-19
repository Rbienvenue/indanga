"use client";

import type { House } from "@indanga/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  Heart,
  Home,
  KeyRound,
  MapPin,
  Maximize2,
  MessageCircle,
  ShieldCheck,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ApiResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { cn, formatPrice } from "@/lib/utils";


type Booking = {
  id: string;
  houseId: string;
};
function Gallery({ house }: { house: House }) {
  const media = house.media.length > 0 ? house.media : [];
  const images = Array.from({ length: 5 }, (_, index) => media[index % media.length]);

  return (
    <Dialog>
      <div className="grid h-[22rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[30rem] lg:h-[34rem]">
        {images.map((src, index) => (
          <DialogTrigger
            key={`${src}-${index}`}
            className={cn(
              "group relative overflow-hidden bg-muted text-left",
              index === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block",
            )}
          >
            <Image
              src={src}
              alt={`${house.name} view ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "25vw"}
            />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </DialogTrigger>
        ))}
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="absolute right-4 bottom-4 z-10 h-10 border border-black/10 bg-white/95 px-4 text-slate-950 shadow-lg hover:bg-white"
          >
            <Maximize2 />
            View all photos
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-[#f7f5f0] p-5 sm:max-w-5xl">
        <DialogTitle className="text-xl">{house.name}</DialogTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {media.map((src, index) => (
            <div
              key={`${src}-dialog-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt={`${house.name} photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
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
  const [notice, setNotice] = useState<string>();

  const houseQuery = useQuery<ApiResponse<House>>({
    queryKey: ["houses", houseId],
    queryFn: () => fetcher(`/houses/${houseId}`),
  });

  const favoriteMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<{ isFavorite: boolean }>>(`/houses/${houseId}/favorites`, {
        method: "POST",
      }),
    onSuccess: ({ data }) => {
      setIsFavorite(data.isFavorite);
      setNotice(data.isFavorite ? "Saved to your favorites." : "Removed from your favorites.");
      void queryClient.invalidateQueries({ queryKey: ["houses", "favorites"] });
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<Booking>>("/bookings", {
        method: "POST",
        body: JSON.stringify({ houseId }),
      }),
    onSuccess: () => {
      setNotice("Your booking is confirmed. You can view it from your dashboard.");
      void queryClient.invalidateQueries({ queryKey: ["houses", houseId] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => setNotice(error.message),
  });

  function requireAuthentication(action: () => void) {
    if (!session) {
      const callbackUrl = `/houses/${houseId}`;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    action();
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
    setNotice("Link copied to your clipboard.");
  }

  if (houseQuery.isLoading) return <HouseDetailsSkeleton />;

  if (houseQuery.isError || !houseQuery.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5f0] px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-white shadow-sm">
            <Home className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">We could not find this home</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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
  const isAvailable = house.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-900/8 bg-[#f7f5f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="INDANGA home">
            <span className="text-lg font-black tracking-[0.12em] text-[#17174a]">INDANGA</span>
          </Link>
          <div className="flex items-center gap-1">
            <ActionButton icon={Share2} label="Share" onClick={shareHouse} />
            <ActionButton
              icon={Heart}
              label={isFavorite ? "Saved" : "Save"}
              active={isFavorite}
              onClick={() => requireAuthentication(() => favoriteMutation.mutate())}
            />
            {!session ? (
              <Button
                variant="outline"
                asChild
                className="ml-2 hidden h-10 px-5 md:inline-flex"
              >
                <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/houses/${houseId}`)}`}>
                  Sign in
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex items-center gap-2 py-5 text-sm text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Explore homes
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate">{house.propertyType}</span>
        </div>

        <Gallery house={house} />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
          <div>
            <div className="flex flex-col gap-5 border-b border-slate-900/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#17174a] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {house.propertyType}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      isAvailable
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {isAvailable ? "Available now" : "Currently booked"}
                  </span>
                </div>
                <h1 className="max-w-3xl text-3xl leading-tight font-black tracking-[-0.035em] sm:text-4xl">
                  {house.name}
                </h1>
                <p className="mt-4 flex items-center gap-2 text-slate-600">
                  <MapPin className="size-4 text-primary" />
                  {house.address || house.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-900/10 border-b border-slate-900/10 py-7">
              <PropertyFact
                icon={BedDouble}
                value={house.bedrooms}
                label={house.bedrooms === 1 ? "bedroom" : "bedrooms"}
              />
              <PropertyFact
                icon={Bath}
                value={house.bathrooms}
                label={house.bathrooms === 1 ? "bathroom" : "bathrooms"}
              />
              <PropertyFact icon={Building2} value={house.propertyType} label="property type" />
            </div>

            <section className="py-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The space
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">A place to settle into</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                {house.description}
              </p>
            </section>

            <Separator className="bg-slate-900/10" />

            <section className="py-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Why it works
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Designed for an easy move</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Feature
                  icon={KeyRound}
                  title="Ready to call home"
                  description={`A ${house.propertyType.toLowerCase()} listed for long-term monthly living.`}
                />
                <Feature
                  icon={MapPin}
                  title="Convenient location"
                  description={`Set in ${house.location}, with the full address available for your visit.`}
                />
                <Feature
                  icon={ShieldCheck}
                  title="Clear availability"
                  description="Availability is kept current so you know when a home is ready to book."
                />
                <Feature
                  icon={MessageCircle}
                  title="Support when needed"
                  description="Your booking stays connected to INDANGA from confirmation onward."
                />
              </div>
            </section>

            <Separator className="bg-slate-900/10" />
          </div>

          <aside className="sticky top-24 hidden lg:block">
            <BookingCard
              house={house}
              isAvailable={isAvailable}
              isPending={bookingMutation.isPending}
              notice={notice}
              onBook={() => requireAuthentication(() => bookingMutation.mutate())}
            />
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/10 bg-[#f7f5f0]/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-5">
          <div>
            <p className="text-lg font-black">{formatPrice(house.price)}</p>
            {/*<p className="text-xs text-slate-500">per month</p>*/}
          </div>
          <Button
            className="h-12 min-w-40 px-6 font-bold"
            disabled={!isAvailable || bookingMutation.isPending}
            onClick={() => requireAuthentication(() => bookingMutation.mutate())}
          >
            {bookingMutation.isPending
              ? "Booking..."
              : isAvailable
                ? "Book this home"
                : "Unavailable"}
          </Button>
        </div>
        {notice ? <p className="mt-2 text-center text-xs text-slate-600">{notice}</p> : null}
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
        <p className="text-xs text-slate-500">{label}</p>
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
    <div className="flex gap-4 rounded-2xl border border-slate-900/8 bg-white/55 p-5">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-[#17174a]">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function BookingCard({
  house,
  isAvailable,
  isPending,
  notice,
  onBook,
}: {
  house: House;
  isAvailable: boolean;
  isPending: boolean;
  notice?: string;
  onBook: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-black tracking-tight">{formatPrice(house.price)}</p>
          <p className="text-sm text-slate-500">per month</p>
        </div>
      </div>

      <div className="my-6 rounded-xl border border-slate-900/10">
        <div className="flex items-center gap-3 p-4">
          <CalendarCheck className="size-5 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Availability
            </p>
            <p className="mt-0.5 text-sm font-semibold">
              {isAvailable ? "Ready to book now" : "Currently booked"}
            </p>
          </div>
        </div>
      </div>

      <Button
        className="h-12 w-full rounded-xl text-base font-bold shadow-lg shadow-indigo-900/15"
        disabled={!isAvailable || isPending}
        onClick={onBook}
      >
        {isPending ? "Confirming..." : isAvailable ? "Book this home" : "Not available"}
      </Button>

      {notice ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-700">{notice}</p>
      ) : null}

      <Separator className="my-5 bg-slate-900/10" />
      <div className="space-y-3 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600" /> Verified listing details
        </p>
        <p className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600" /> Secure booking through INDANGA
        </p>
      </div>
    </div>
  );
}

function HouseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="h-18 border-b border-slate-900/8" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-5 h-5 w-40" />
        <Skeleton className="h-[22rem] w-full rounded-2xl sm:h-[30rem] lg:h-[34rem]" />
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_23rem]">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-12 w-3/4" />
            <Skeleton className="mt-4 h-5 w-1/2" />
            <div className="mt-10 grid grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
            <Skeleton className="mt-10 h-40 w-full" />
          </div>
          <Skeleton className="hidden h-96 rounded-2xl lg:block" />
        </div>
      </main>
    </div>
  );
}
