import StatsCards from "@/components/user/cards-grid";
import UserHeader from "@/components/user/header";
import { QuickActions } from "@/components/user/quick-actions";
import { RecentActivity } from "@/components/user/recent-activity";

export default function Page() {
    return (
        <div className="py-6">
            <UserHeader />
            <StatsCards />
            <div className="grid gap-6 lg:grid-cols-3 mt-7">
                <RecentActivity />
                <QuickActions />
            </div>
        </div>
    )
}
