import {
  BadgeCheck,
  CalendarCheck,
  Clock3,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const activities = [
  {
    id: 1,
    title: "Payment Successful",
    description: "You paid $360 for Kigali Marriott Hotel",
    date: "May 15, 2024",
    amount: "$360",
    color: "bg-green-100",
    icon: BadgeCheck,
    statusColor: "text-green-600",
  },
  {
    id: 2,
    title: "Booking Confirmed",
    description: "Your booking for Toyota RAV4 2022 is confirmed",
    date: "May 14, 2024",
    amount: "$225",
    color: "bg-purple-100",
    icon: CalendarCheck,
    statusColor: "text-green-600",
  },
  {
    id: 3,
    title: "Booking Request Sent",
    description: "You requested Modern Apartment",
    date: "May 13, 2024",
    amount: "Pending",
    color: "bg-orange-100",
    icon: Clock3,
    statusColor: "text-orange-500",
  },
]

export function RecentActivity() {
  return (
    <Card className="rounded-3xl border-0 shadow-sm md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>

        <button className="text-sm font-medium text-indigo-600 hover:underline">
          View all
        </button>
      </CardHeader>

      <CardContent className="space-y-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between"
          >
            <div className="flex gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${activity.color}`}
              >
                <activity.icon className="h-5 w-5" />
              </div>

              <div>
                <h4 className="font-semibold">
                  {activity.title}
                </h4>

                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.date}
                </p>
              </div>
            </div>

            <p
              className={`font-semibold ${activity.statusColor}`}
            >
              {activity.amount}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}