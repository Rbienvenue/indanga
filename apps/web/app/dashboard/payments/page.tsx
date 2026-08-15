"use client";

import { CreditCard, Clock4 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

type BookingWithHouse = {
  id: string;
  house: {
    id: string;
    name: string;
    location: string;
    price: number;
    propertyType?: string;
    media?: string[];
  };
  createdAt: string;
};

type BookingPaginationResponse = {
  data: BookingWithHouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function EmptyPayments() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CreditCard className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No payments found</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your upcoming payments will appear here once you book a house.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/bookings">View Bookings</Link>
      </Button>
    </div>
  );
}

export default function PaymentsPage() {
  const paymentsQuery = useQuery<BookingPaginationResponse>({
    queryKey: ["dashboard-payments"],
    queryFn: () => fetcher("/bookings?page=1&limit=6"),
  });

  const bookings = paymentsQuery.data?.data ?? [];

  return (
    <main>
      <section className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage your payment overview and upcoming charges.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/dashboard/bookings">View Bookings</Link>
        </Button>
      </section>

      {paymentsQuery.isLoading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-5 rounded-md bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <div className="h-4 rounded-md bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paymentsQuery.isError ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load payment details. Please try again.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void paymentsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyPayments />
      ) : (
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{booking.house.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{booking.house.location}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Amount due</span>
                  <strong>${booking.house.price.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Booking date</span>
                  <time dateTime={booking.createdAt}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock4 className="size-4" />
                  <span>Payment will be processed after booking confirmation.</span>
                </div>
                <Button asChild size="sm">
                  <Link href={`/properties/${booking.house.id}`}>View house</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
