import Link from "next/link";
import {
  Building2,
  Car,
  ChevronDown,
  House,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const actions = [
  {
    title: "Book a Hotel",
    href: "/properties?type=hotel",
    icon: Building2,
  },
  {
    title: "Rent a Car",
    href: "/properties?type=car",
    icon: Car,
  },
  {
    title: "Find a Home",
    href: "/properties?type=house",
    icon: House,
  },
  {
    title: "Browse All Listings",
    href: "/properties",
    icon: Search,
  },
] as const;

export function QuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle>Quick Actions</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Open
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <DropdownMenuItem key={action.title} asChild>
                  <Link href={action.href} className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <span>{action.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pt-0 text-sm text-muted-foreground">
        Choose a common destination from the menu.
      </CardContent>
    </Card>
  );
}