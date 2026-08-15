"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  House,
  CalendarCheck,
  CreditCard,
  Star,
  PlusCircle,
  Eye,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

type AgentStats = {
  totalProperties: number;
  activeBookings: number;
  totalRevenue: number;
  avgRating: number | null;
};

type BookingWithDetails = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  house: {
    id: string;
    name: string;
    location: string;
    price: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function formatRWF(amount: number) {
  return `${amount.toLocaleString()} RWF`;
}

function AgentStatCards() {
  const statsQuery = useQuery<ApiResponse<AgentStats>>({
    queryKey: ["agent-stats"],
    queryFn: () => fetcher("/properties/stats"),
  });

  const stats = statsQuery.data?.data;

  if (statsQuery.isLoading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Properties"
        value={stats?.totalProperties ?? 0}
        icon={<House className="size-5" />}
      />
      <StatCard
        title="Active Bookings"
        value={stats?.activeBookings ?? 0}
        icon={<CalendarCheck className="size-5" />}
      />
      <StatCard
        title="Total Revenue"
        value={formatRWF(stats?.totalRevenue ?? 0)}
        icon={<CreditCard className="size-5" />}
      />
      <StatCard
        title="Avg. Rating"
        value={stats?.avgRating != null ? `${stats.avgRating} ★` : "—"}
        icon={<Star className="size-5" />}
      />
    </section>
  );
}

function AgentQuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full justify-start gap-3" variant="outline" size="lg">
          <Link href="/dashboard/properties/new">
            <PlusCircle className="size-5" />
            Add New Property
          </Link>
        </Button>
        <Button asChild className="w-full justify-start gap-3" variant="outline" size="lg">
          <Link href="/dashboard/search">
            <Eye className="size-5" />
            View All Properties
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function BookingActionButtons({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetcher<ApiResponse<unknown>>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Booking status updated");
      void queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update booking status");
    },
  });

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-green-600 hover:bg-green-50 hover:text-green-700"
        disabled={statusMutation.isPending}
        onClick={() => statusMutation.mutate("APPROVED")}
      >
        {statusMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={statusMutation.isPending}
        onClick={() => statusMutation.mutate("REJECTED")}
      >
        {statusMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
        Reject
      </Button>
    </div>
  );
}

function RecentBookingRequests() {
  const bookingsQuery = useQuery<PaginationResponse<BookingWithDetails>>({
    queryKey: ["recent-bookings"],
    queryFn: () => fetcher("/bookings?page=1&limit=5"),
  });

  const bookings = bookingsQuery.data?.data ?? [];

  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Booking Requests</CardTitle>
        <Button asChild variant="link" size="sm" className="text-xs">
          <Link href="/dashboard/bookings">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookingsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No booking requests yet. They will appear here once tenants book your properties.
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{booking.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.house.name} • {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusColors[booking.status]}>
                    {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                  </Badge>
                  {booking.status === "PENDING" && <BookingActionButtons bookingId={booking.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AgentDashboard({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your properties and bookings</p>
      </div>

      <AgentStatCards />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecentBookingRequests />
        <AgentQuickActions />
      </div>
    </div>
  );
}
