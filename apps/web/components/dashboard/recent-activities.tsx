"use client";

import { Heart, CalendarCheck, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const activities = [
  {
    title: "Today",
    items: [
      {
        icon: Heart,
        iconColor: "text-red-500",
        iconBg: "bg-red-50 dark:bg-red-950/30",
        action: "Saved Modern Apartment",
      },
    ],
  },
  {
    title: "Yesterday",
    items: [
      {
        icon: CalendarCheck,
        iconColor: "text-green-600",
        iconBg: "bg-green-50 dark:bg-green-950/30",
        action: "Booked Kigali Heights",
      },
    ],
  },
  {
    title: "Last Week",
    items: [
      {
        icon: Star,
        iconColor: "text-yellow-500",
        iconBg: "bg-yellow-50 dark:bg-yellow-950/30",
        action: "Reviewed Green Villa",
      },
    ],
  },
];

export function RecentActivity() {
  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative pl-6">
          {/* Timeline */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-8">
            {activities.map((section, index) => (
              <div key={section.title}>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>

                <div className="space-y-5">
                  {section.items.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.action}
                        className="relative flex items-center gap-4"
                      >
                        {/* Timeline Node */}
                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${activity.iconBg}`}
                        >
                          <Icon
                            size={18}
                            className={activity.iconColor}
                          />
                        </div>

                        <div>
                          <p className="font-medium">
                            {activity.action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {index < activities.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}