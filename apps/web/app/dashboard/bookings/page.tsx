"use client";

import { useTranslations } from "next-intl";
import type { BookingStatus } from "@indanga/db";
import type { House } from "@/@types";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PaginationResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { BookingCard, BookingDetails, type Booking } from "@/components/bookings/booking-card";
import { BookingPropertyCard } from "@/components/bookings/booking-property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetcher } from "@/lib/fetcher";

const PAGE_SIZE = 6;
type BookingFilter = BookingStatus | "all";

type BookingWithHouse = Booking & {
  paymentDeadline?: string | null;
  createdAt: string;
  nights?: number | null;
  unitPrice?: number | null;
  roomType: { id: string; name: string; price: number } | null;
  house: House;
  client: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

function EmptyBookings({ isAgent, filtered }: { isAgent: boolean; filtered: boolean }) {
  const t = useTranslations("bookings");
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">
        {filtered ? t("noStatusBookings") : isAgent ? t("noRequests") : t("noBookings")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {filtered ? t("otherStatus") : isAgent ? t("requestsHere") : t("bookingsHere")}
      </p>
      {!isAgent && (
        <Button asChild className="mt-6">
          <Link href="/">{t("exploreListings")}</Link>
        </Button>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("bookings");
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("paginationLabel")}
      className="mt-6 flex items-center justify-between border-t pt-5"
    >
      <p className="text-sm text-muted-foreground">{t("pageCount", { page, total: totalPages })}</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft />
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}

export default function BookingsPage() {
  const t = useTranslations("bookings");
  const bookingFilters = [
    { value: "all", label: t("all") },
    { value: "REQUESTED", label: t("new") },
    { value: "AWAITING_PAYMENT", label: t("awaitingTitle") },
    { value: "CONFIRMED", label: t("confirmedFilter") },
  ] as const satisfies readonly { value: BookingStatus | "all"; label: string }[];
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingFilter>("all");
  const [selectedId, setSelectedId] = useState<string>();
  const router = useRouter();
  const session = useSession();
  const isAgent = session?.user?.role === "landlord";

  const bookingsQuery = useQuery<PaginationResponse<BookingWithHouse>>({
    queryKey: ["bookings", page, PAGE_SIZE, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status !== "all") params.set("status", status);
      return fetcher(`/bookings?${params}`);
    },
  });

  const bookings = bookingsQuery.data?.data ?? [];
  const meta = bookingsQuery.data?.meta;
  const selectedBooking = bookings.find((booking) => booking.id === selectedId) ?? bookings[0];

  return (
    <main>
      <section className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAgent ? t("bookings") : t("myBookings")}
            </h1>
            <p className="text-muted-foreground">
              {isAgent ? t("tenantBookings") : t("yourBookings")}
            </p>
          </div>
        </div>

        {!isAgent && (
          <Button asChild>
            <Link href="/">{t("exploreListings")}</Link>
          </Button>
        )}
      </section>

      <Tabs
        className="mt-6"
        value={status}
        onValueChange={(value) => {
          const filter = bookingFilters.find((item) => item.value === value);
          if (!filter) return;
          setStatus(filter.value);
          setPage(1);
          setSelectedId(undefined);
        }}
      >
        <TabsList aria-label={t("filterStatus")} className="h-auto max-w-full flex-wrap">
          {bookingFilters.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status}>
          {bookingsQuery.isLoading ? (
            <section className="mt-6 space-y-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </section>
          ) : bookingsQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">{t("bookingsLoadError")}</p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => void bookingsQuery.refetch()}
              >
                {t("tryAgain")}
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <EmptyBookings isAgent={isAgent} filtered={status !== "all"} />
          ) : isAgent ? (
            <>
              <section className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      selected={selectedBooking?.id === booking.id}
                      onSelect={() => setSelectedId(booking.id)}
                    />
                  ))}
                  {meta && (
                    <Pagination
                      page={meta.page}
                      totalPages={meta.totalPages}
                      isFetching={bookingsQuery.isFetching}
                      onPageChange={setPage}
                    />
                  )}
                </div>
                <BookingDetails
                  key={selectedBooking?.id}
                  booking={selectedBooking}
                  isCar={session?.user?.providerType === "CAR"}
                />
              </section>
            </>
          ) : (
            <>
              <section className="mt-6 space-y-3">
                {bookings.map((booking) => (
                  <BookingPropertyCard
                    key={booking.id}
                    booking={booking}
                    selected={false}
                    onSelect={() => router.push(`/properties/${booking.house.id}`)}
                  />
                ))}
                {meta && (
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    isFetching={bookingsQuery.isFetching}
                    onPageChange={setPage}
                  />
                )}
              </section>
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
