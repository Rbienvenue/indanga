"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  CreditCard,
  User,
  LifeBuoy,
  LogOut,
  House,
  PlusCircle,
  Search,
  Bell,
  Users,
  Star,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const tenantItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "My Favorites", href: "/dashboard/favorites", icon: Heart },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Search", href: "/dashboard/search", icon: Search },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "Profile Settings", href: "/dashboard/profile", icon: User },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

const agentItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Properties", href: "/dashboard/search", icon: House },
  { title: "Add Property", href: "/dashboard/properties/new", icon: PlusCircle },
  { title: "Booking Requests", href: "/dashboard/bookings", icon: Calendar },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "Profile Settings", href: "/dashboard/profile", icon: User },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

const adminItems = [
  { title: "Overview", href: "/admin", icon: Shield },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Properties", href: "/admin/properties", icon: House },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const items =
    session?.user?.role === "admin"
      ? adminItems
      : session?.user?.role === "landlord"
        ? agentItems
        : tenantItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <Link href="/dashboard" className="flex h-12 items-center px-2">
          <Image src="/logo.png" alt="Indanga" className="rounded-xl" width={54} height={54} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="justify-start gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-2"
          onClick={async () =>
            signOut({
              fetchOptions: {
                onSuccess: () => router.replace("/auth/login"),
              },
            })
          }
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
