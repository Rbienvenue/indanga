"use client";

import { Heart, CalendarCheck, CreditCard, Star } from "lucide-react";
import { StatCard } from "./stat-card";

const stats = [
  {
    title: "Favorites",
    value: "12",
    icon: <Heart className="size-5" />,
  },
  {
    title: "Active Bookings",
    value: "2",
    icon: <CalendarCheck className="size-5" />,
  },
  {
    title: "Payments",
    value: "1",
    icon: <CreditCard className="size-5" />,
  },
  {
    title: "Reviews",
    value: "5",
    icon: <Star className="size-5" />,
  },
];

export function StatisticsCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </section>
  );
}
