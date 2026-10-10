"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, House, CalendarCheck, CreditCard, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

import type { ApiResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { RecentProperties } from "@/components/dashboard/recent-properties";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

type AdminStats = {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  totalProperties: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  pendingVerification: number;
  pendingListings: number;
  failedPayments: number;
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
};

function StatsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default function AdminPage() {
  const statsQuery = useQuery<ApiResponse<AdminStats>>({
    queryKey: ["admin-stats"],
    queryFn: () => fetcher("/admin/stats"),
  });

  const stats = statsQuery.data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Admin & Operations"
        description="Review bookings, provider verification, and payments"
      />

      {statsQuery.isLoading ? (
        <StatsSkeleton />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={<Users className="size-5" />}
            />
            <StatCard
              title="Clients"
              value={stats?.totalTenants ?? 0}
              icon={<Users className="size-5" />}
            />
            <StatCard
              title="Providers"
              value={stats?.totalLandlords ?? 0}
              icon={<Users className="size-5" />}
            />
            <StatCard
              title="Total Properties"
              value={stats?.totalProperties ?? 0}
              icon={<House className="size-5" />}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Bookings"
              value={stats?.totalBookings ?? 0}
              icon={<CalendarCheck className="size-5" />}
            />
            <StatCard
              title="Pending Bookings"
              value={stats?.pendingBookings ?? 0}
              icon={<Clock className="size-5" />}
            />
            <StatCard
              title="Confirmed Bookings"
              value={stats?.approvedBookings ?? 0}
              icon={<CheckCircle className="size-5" />}
            />
            <StatCard
              title="Commission earned"
              value={formatPrice(stats?.totalRevenue ?? 0)}
              icon={<CreditCard className="size-5" />}
            />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Operations queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Provider verification",
                  count: stats?.pendingVerification ?? 0,
                  description: "Identity submissions awaiting review",
                  href: "/admin/kyc",
                },
                {
                  title: "Pending listings",
                  count: stats?.pendingListings ?? 0,
                  description: "Listings awaiting publication",
                  href: "/admin/properties",
                },
                {
                  title: "Pending bookings",
                  count: stats?.pendingBookings ?? 0,
                  description: "Requests and bookings awaiting payment",
                  href: "/admin/bookings",
                },
                {
                  title: "Failed payments",
                  count: stats?.failedPayments ?? 0,
                  description: "Failed payment attempts",
                  href: "/admin/payments",
                },
              ].map((item) => (
                <div
                  key={item.href}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.title} <span className="ml-2 text-primary">{item.count}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={item.href}>Review</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <RevenueChart data={stats?.revenueByMonth ?? []} />
        </>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <RecentPayments />
        <RecentProperties />
      </section>
    </div>
  );
}
