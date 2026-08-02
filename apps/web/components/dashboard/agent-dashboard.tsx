"use client";

import { House, CalendarCheck, CreditCard, Star, PlusCircle, Eye } from "lucide-react";
import Link from "next/link";
import { StatCard } from "./stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AgentStatCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Properties"
        value="0"
        icon={<House className="size-5" />}
      />
      <StatCard
        title="Active Bookings"
        value="0"
        icon={<CalendarCheck className="size-5" />}
      />
      <StatCard
        title="Total Revenue"
        value="0 RWF"
        icon={<CreditCard className="size-5" />}
      />
      <StatCard
        title="Avg. Rating"
        value="—"
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

export function AgentDashboard({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your properties and bookings
        </p>
      </div>

      <AgentStatCards />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No booking requests yet. They will appear here once tenants book your properties.
            </p>
          </CardContent>
        </Card>
        <AgentQuickActions />
      </div>
    </div>
  );
}
