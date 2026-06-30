import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, BookOpen } from "lucide-react"

const stats = [
  {
    title: "Bookings",
    value: "12",
    description: "Total Bookings",
    icon: BookOpen,
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-500",
  },
  {
    title: "Upcoming",
    value: "4",
    description: "Next 7 Days",
    icon: Calendar,
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-500",
  },
  {
    title: "Completed",
    value: "8",
    description: "Completed Bookings",
    icon: CheckCircle,
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-500",
  },
]

export default function StatsCards() {
  return (
    <div className="mt-7 grid gap-7 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card
            key={stat.title}
            className={`border-1 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <Icon className={`h-6 w-6 ${stat.text}`} />
              </div>
            </CardHeader>

            <CardContent>
              <h2 className="text-3xl font-bold">{stat.value}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}