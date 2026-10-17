"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { Messages } from "@indanga/translations";
import { Collapsible } from "radix-ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/@types";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { fetcher } from "@/lib/fetcher";
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
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  useSidebar,
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
  Search,
  Bell,
  Users,
  Star,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Settings,
  CarFront,
  MessageSquare,
  FileChartColumn,
  BedDouble,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type NavigationItem = {
  title: keyof Messages["navigation"];
  href: string;
  icon: typeof LayoutDashboard;
};

const tenantItems: NavigationItem[] = [
  { title: "overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "myBookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "myFavorites", href: "/dashboard/favorites", icon: Heart },
  { title: "search", href: "/dashboard/search", icon: Search },
  { title: "profileSettings", href: "/dashboard/profile", icon: User },
  { title: "support", href: "/dashboard/support", icon: LifeBuoy },
];

const agentItems: NavigationItem[] = [
  { title: "overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "listings", href: "/dashboard/listings", icon: House },
  { title: "bookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "guests", href: "/dashboard/guest", icon: Users },
  { title: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "profileSettings", href: "/dashboard/profile", icon: User },
];

const carItems: NavigationItem[] = agentItems
  .filter((item) => item.href !== "/dashboard/reviews")
  .map((item) => {
    if (item.href === "/dashboard/listings") return { ...item, title: "vehicles", icon: CarFront };
    if (item.href === "/dashboard/guest") return { ...item, title: "clients" };
    return item;
  });
// carItems.splice(7, 0, { title: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck });

const houseItems: NavigationItem[] = agentItems
  .filter((item) => item.href !== "/dashboard/calendar")
  .map((item) => {
    if (item.href === "/dashboard/listings") return { ...item, title: "houses" };
    if (item.href === "/dashboard/guest") return { ...item, title: "clients" };
    if (item.href === "/dashboard/properties/new") return { ...item, title: "addHouse" };
    return item;
  });

const adminGroups: (Omit<NavigationItem, "href"> & { items: NavigationItem[] })[] = [
  {
    title: "users",
    icon: Users,
    items: [
      { title: "users", href: "/admin/users", icon: Users },
      { title: "verification", href: "/admin/kyc", icon: BadgeCheck },
    ],
  },
  {
    title: "listings",
    icon: House,
    items: [
      { title: "listing", href: "/admin/properties", icon: House },
      { title: "listingReports", href: "/admin/reports", icon: FileChartColumn },
    ],
  },
];

const adminItems: NavigationItem[] = [
  { title: "overview", href: "/admin", icon: Shield },
  { title: "bookingQueue", href: "/admin/bookings", icon: Calendar },
  { title: "paymentsRefunds", href: "/admin/payments", icon: CreditCard },
  { title: "supportInbox", href: "/admin/support", icon: LifeBuoy },
  { title: "settings", href: "/admin/settings", icon: Settings },
];

const kycItems: NavigationItem[] = [
  { title: "verification", href: "/dashboard/kyc", icon: ShieldCheck },
];

export function AppSidebar() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const { setOpenMobile, setOpen } = useSidebar();
  const closeMobileSidebar = React.useCallback(() => setOpenMobile(false), [setOpenMobile]);

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const items: NavigationItem[] =
    session?.user?.role === "admin"
      ? adminItems
      : session?.user?.role === "landlord"
        ? session.user.kycStatus !== "APPROVED"
          ? kycItems
          : session.user.providerType === "CAR"
            ? carItems
            : session.user.providerType === "HOUSE"
              ? houseItems
              : [
                  ...agentItems.slice(0, 4),
                  { title: "rooms", href: "/dashboard/rooms", icon: BedDouble },
                  ...agentItems.slice(4),
                ]
        : tenantItems;

  const hasMessages = items.some(
    (item) => item.href === "/dashboard/messages" || item.href === "/admin/support",
  );
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocketIo(Boolean(session && hasMessages));
  const unreadQuery = useQuery({
    queryKey: ["messages", "unread-count", session?.user.id],
    queryFn: () => fetcher<ApiResponse<{ count: number }>>("/messages/conversations/unread-count"),
    enabled: Boolean(session && hasMessages),
  });
  const unreadCount = unreadQuery.data?.data.count ?? 0;
  const isAdmin = session?.user?.role === "admin";
  const pendingQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetcher<ApiResponse<{ pendingBookings: number }>>("/admin/stats"),
    enabled: Boolean(session && isAdmin),
    staleTime: 30 * 1000,
  });
  const pendingBookings = pendingQuery.data?.data.pendingBookings ?? 0;

  React.useEffect(() => {
    if (!socket || !isConnected || !session || !hasMessages) return;
    function refreshMessages() {
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
    // The sidebar owns the inbox subscription so it survives leaving the Messages page.
    socket.on("messages:update", refreshMessages);
    socket.on("subscribed:messages", refreshMessages);
    socket.emit("subscribe:messages");
    return () => {
      socket.off("messages:update", refreshMessages);
      socket.off("subscribed:messages", refreshMessages);
      socket.emit("unsubscribe:messages");
    };
  }, [socket, isConnected, session, hasMessages, queryClient]);

  function renderMenuItem(item: NavigationItem) {
    const active =
      pathname === item.href ||
      (item.href !== "/dashboard" &&
        item.href !== "/admin" &&
        pathname.startsWith(`${item.href}/`));

    const messageItem = item.href === "/dashboard/messages" || item.href === "/admin/support";
    const queueItem = item.href === "/admin/bookings";
    const badgeCount = messageItem ? unreadCount : queueItem ? pendingBookings : 0;
    const label =
      badgeCount > 0
        ? messageItem
          ? t("unreadMessages", { title: t(item.title), count: badgeCount })
          : t("pendingBookings", { title: t(item.title), count: badgeCount })
        : t(item.title);

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={active} tooltip={label}>
          <Link href={item.href} onClick={closeMobileSidebar} aria-label={label}>
            <item.icon />
            <span>{t(item.title)}</span>
          </Link>
        </SidebarMenuButton>
        {badgeCount > 0 ? (
          <SidebarMenuBadge
            aria-hidden="true"
            className="rounded-full bg-destructive text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:text-[9px]"
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <Link
          href={session?.user?.role === "admin" ? "/admin" : "/dashboard"}
          onClick={closeMobileSidebar}
          className="flex h-12 items-center justify-center px-2 group-data-[collapsible=icon]:px-0"
        >
          <Image
            src="/logo.png"
            alt="Indanga"
            className="rounded-xl group-data-[collapsible=icon]:size-8 size-[54px]"
            width={54}
            height={54}
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {session?.user?.role === "admin" ? (
                <>
                  {adminItems.slice(0, 1).map(renderMenuItem)}
                  {adminGroups.map((group) => (
                    <Collapsible.Root key={group.title} asChild defaultOpen={false}>
                      <SidebarMenuItem>
                        <Collapsible.Trigger asChild>
                          <SidebarMenuButton
                            tooltip={t(group.title)}
                            isActive={group.items.some(
                              (item) =>
                                pathname === item.href || pathname.startsWith(`${item.href}/`),
                            )}
                            onClick={() => setOpen(true)}
                            className="group/collapsible"
                          >
                            <group.icon />
                            <span>{t(group.title)}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                          <SidebarMenuSub>{group.items.map(renderMenuItem)}</SidebarMenuSub>
                        </Collapsible.Content>
                      </SidebarMenuItem>
                    </Collapsible.Root>
                  ))}
                  {adminItems.slice(1).map(renderMenuItem)}
                </>
              ) : (
                items.map(renderMenuItem)
              )}
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
          <span className="group-data-[collapsible=icon]:hidden">{t("signOut")}</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
