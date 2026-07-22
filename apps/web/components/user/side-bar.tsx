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
import ThemeToggle from "@/components/providers/theme-toggle";
import Image from "next/image";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Bookings",
    url: "dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "My Favorites",
    url: "dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Payments",
    url: "dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Profile Settings",
    url: "dashboard/profile",
    icon: User,
  },
  {
    title: "Support",
    url: "dashboard/support",
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
      <div className="bg-[#0A0A2C] p-4 group-data-[collapsible=icon]:hidden">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0A0A2C] p-2 shadow-sm">
          <Image
            src="/logo.png"
            alt="INDANGA"
            width={90}
            height={90}
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-white">
          MUGISHA
        </h2>
      </div>
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
        <div className="flex items-center justify-between gap-3 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <span className="text-sm text-white/70">Appearance</span>
          <ThemeToggle />
        </div>
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
