"use client";

import {
  Heart,
  CalendarCheck,
  CreditCard,
  Star,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import StatCard from "./stat-card";

const stats = [
  {
    title: "Favorites",
    value: "12",
    subtitle: "Saved houses",
    icon: Heart,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Bookings",
    value: "2",
    subtitle: "Upcoming stays",
    icon: CalendarCheck,
    iconBg: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600",
  },
  {
    title: "Payments",
    value: "1",
    subtitle: "Pending payment",
    icon: CreditCard,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600",
  },
  {
    title: "Reviews",
    value: "5",
    subtitle: "Your reviews",
    icon: Star,
    iconBg: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600",
  },
];

export function StatisticsCards() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        return (
            <StatCard
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
        );
      })}
    </section>
  );
}