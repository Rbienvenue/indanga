"use client";

import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/providers/theme-toggle";
import { UserAvatar } from "../user/user-avatar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16.5 items-center justify-between border-b bg-background/85 px-4 backdrop-blur lg:px-6">
      <SidebarTrigger className="text-muted-foreground" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationsDrawer />
        <UserAvatar showDashboard={false} />
      </div>
    </header>
  );
}
