"use client";

import { usePathname } from "next/navigation";

import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/providers/theme-toggle";
import { UserAvatar } from "../user/user-avatar";

export function Topbar() {
  const pathname = usePathname();
  const hasPropertySearch = pathname === "/dashboard" || pathname === "/dashboard/search";
  return (
    <header className="sticky top-0 z-30 flex min-h-16.5 flex-wrap items-center justify-between gap-x-4 border-b bg-background/85 px-4 backdrop-blur lg:px-6">
      <SidebarTrigger className="text-muted-foreground" />
      {hasPropertySearch ? (
        <div
          id="header-property-search"
          className="order-last w-full pb-3 empty:hidden md:order-none md:max-w-xl md:min-w-0 md:flex-1 md:pb-0"
        />
      ) : null}
      <div className="flex h-16.5 shrink-0 items-center gap-1">
        <ThemeToggle />
        <NotificationsDrawer />
        <UserAvatar showDashboard={false} />
      </div>
    </header>
  );
}
