"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { SearchInput } from "@/components/home/search-input";
import { useSession } from "@/components/providers/session-provider";

import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserAvatar } from "../user/user-avatar";
import { LocaleSelector } from "@/components/locale-selector";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [search, setSearch] = useState("");
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const hasPageSearch = pathname === "/dashboard/search" || pathname === "/dashboard";

  function handleSearch() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const query = params.toString();
    router.push(query ? `/dashboard/search?${query}` : "/dashboard/search");
  }
  return (
    <header className="sticky top-0 z-30 flex min-h-16.5 items-center justify-between gap-x-2 sm:gap-x-4 border-b bg-background/85 px-4 backdrop-blur lg:px-6">
      <SidebarTrigger className="text-muted-foreground" />
      {isDashboard && session?.user.role === "tenant" ? (
        <div
          id={hasPageSearch ? "header-property-search" : undefined}
          className="min-w-0 flex-1 empty:hidden md:max-w-xl"
        >
          {!hasPageSearch ? (
            <SearchInput
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={() => setSearch("")}
            />
          ) : null}
        </div>
      ) : null}
      <div className="flex h-16.5 shrink-0 items-center gap-1">
        <LocaleSelector />
        <NotificationsDrawer />
        <UserAvatar showDashboard={false} showThemeToggle />
      </div>
    </header>
  );
}
