import {
  Building2,
  Car,
  House,
  Search,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const actions = [
  {
    title: "Book a Hotel",
    icon: Building2,
  },
  {
    title: "Rent a Car",
    icon: Car,
  },
  {
    title: "Find a Home",
    icon: House,
  },
  {
    title: "Browse All Listings",
    icon: Search,
  },
]

export function QuickActions() {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className="flex w-full items-center gap-4 rounded-2xl border bg-white px-5 py-4 transition hover:bg-slate-50"
          >
            <action.icon className="h-5 w-5 text-indigo-600" />

            <span className="font-medium">
              {action.title}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}