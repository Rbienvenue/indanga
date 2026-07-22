"use client";

import { useSession } from "@/components/providers/session-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "@/components/home/search-bar";
import StatsCards from "@/components/user/cards-grid";
import { StatisticsCards } from "@/components/dashboard/stat-card-grid";
import { RecentActivity } from "@/components/dashboard/recent-activities";
import { QuickActions } from "@/components/user/quick-actions";
import { RecommendedHouses } from "@/components/dashboard/recommended";
import { ContinueBrowsing } from "@/components/dashboard/continue-browsing";

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
        "Bienvenue";

    return (
        <main className="flex min-h-screen flex-col items-center gap-4 p-4 w-full">
            <section className="flex items-center gap-6xl justify-between w-full mb-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">
                        {getGreeting()}, {firstName}! 👋
                    </h1>

                    <p className="text-lg text-muted-foreground">
                        Ready to find your next home?
                    </p>
                </div>

                <Avatar className="hidden h-16 w-16 border-2 border-primary/10 md:flex">
                    <AvatarImage
                        src={user?.image ?? ""}
                        alt={user?.name ?? firstName}
                    />

                    <AvatarFallback className="text-lg font-semibold">
                        {firstName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </section>
            <StatisticsCards />
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
                <RecentActivity />
                <QuickActions />
            </div>
            <RecommendedHouses/>
            <SearchBar />
            <ContinueBrowsing />
        </main>
    );
}