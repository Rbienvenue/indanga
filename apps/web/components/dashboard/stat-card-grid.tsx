"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart, CalendarCheck, CreditCard, Star } from "lucide-react";

import type { ApiResponse } from "@/@types";
import { fetcher } from "@/lib/fetcher";
import { StatCard } from "./stat-card";

type TenantStats = {
  favorites: number;
  activeBookings: number;
  payments: number;
  reviews: number;
};

const fallbackStats: TenantStats = {
  favorites: 0,
  activeBookings: 0,
  payments: 0,
  reviews: 0,
};

export function StatisticsCards() {
  const statsQuery = useQuery({
    queryKey: ["dashboard", "tenant-stats"],
    queryFn: () => fetcher<ApiResponse<TenantStats>>("/bookings/stats"),
    staleTime: 60 * 1000,
  });

  const stats = statsQuery.data?.data ?? fallbackStats;
  const value = (count: number) => (statsQuery.isLoading ? "—" : count);

  const cards = [
    {
      title: "Favorites",
      value: value(stats.favorites),
      icon: <Heart className="size-5" />,
    },
    {
      title: "Active Bookings",
      value: value(stats.activeBookings),
      icon: <CalendarCheck className="size-5" />,
    },
    {
      title: "Payments",
      value: value(stats.payments),
      icon: <CreditCard className="size-5" />,
    },
    {
      title: "Reviews",
      value: value(stats.reviews),
      icon: <Star className="size-5" />,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat) => (
        <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
      ))}
    </section>
  );
}
