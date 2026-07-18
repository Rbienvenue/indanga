"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  CreditCard,
  User,
  LifeBuoy,
  LucideLogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/components/providers/session-provider";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Bookings",
    url: "/bookings",
    icon: Calendar,
  },
  {
    title: "My Favorites",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "Profile Settings",
    url: "/profile",
    icon: User,
  },
  {
    title: "Support",
    url: "/support",
    icon: LifeBuoy,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = useSession();
  const user = session?.user;

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon" className="bg-[#0A0A2C] text-white">
      <SidebarMenuButton size="lg" className="bg-[#0A0A2C] rounded-none">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          I
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">INDANGA</span>
          <span className="truncate text-xs">
            {user?.email ?? "Hotels & Tours"}
          </span>
        </div>
      </SidebarMenuButton>
      <SidebarContent className="bg-[#0A0A2C]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mt-5">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-[#0A0A2C]">
        <SidebarMenuButton size="lg" onClick={handleLogout}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-red-600">
            <LucideLogOut />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Logout</span>
            {user?.name ? (
              <span className="truncate text-xs text-white/60">{user.name}</span>
            ) : null}
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
