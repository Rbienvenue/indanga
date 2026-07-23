"use client";

import { useSession } from "@/components/providers/session-provider";
import { StatisticsCards } from "@/components/dashboard/stat-card-grid";
import { RecentActivity } from "@/components/dashboard/recent-activities";
import { QuickActions } from "@/components/user/quick-actions";
import { RecommendedHouses } from "@/components/dashboard/recommended";
import { ContinueBrowsing } from "@/components/dashboard/continue-browsing";
import { SearchBar } from "@/components/home/search-bar";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const session = useSession();
  const user = session?.user;

  const firstName =
    user?.name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ready to find your next home?
        </p>
      </div>

      <StatisticsCards />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecentActivity />
        <QuickActions />
      </div>

      <RecommendedHouses />
      <SearchBar />
      <ContinueBrowsing />
    </div>
  );
}
