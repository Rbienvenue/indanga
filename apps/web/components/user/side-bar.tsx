"use client";

import * as React from "react";
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
  PlusCircle,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const tenantItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "My Favorites", href: "/dashboard/favorites", icon: Heart },
  { title: "Search", href: "/dashboard/search", icon: Search },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Profile Settings", href: "/dashboard/profile", icon: User },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
];

const agentItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Listings", href: "/dashboard/listings", icon: House },
  { title: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "Guests", href: "/dashboard/guest", icon: Users },
  { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "Reviews", href: "/dashboard/reviews", icon: Star },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "Profile Settings", href: "/dashboard/profile", icon: User },
];

const carItems = agentItems
  .filter((item) => item.href !== "/dashboard/reviews" && item.href !== "/dashboard/calendar")
  .map((item) => {
    if (item.href === "/dashboard/listings") return { ...item, title: "Vehicles", icon: CarFront };
    if (item.href === "/dashboard/guest") return { ...item, title: "Clients" };
    return item;
  });
carItems.splice(7, 0, { title: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck });

const houseItems = agentItems
  .filter((item) => item.href !== "/dashboard/calendar")
  .map((item) => {
    if (item.href === "/dashboard/listings") return { ...item, title: "Houses" };
    if (item.href === "/dashboard/guest") return { ...item, title: "Clients" };
    if (item.href === "/dashboard/properties/new") return { ...item, title: "Add House" };
    return item;
  });

const adminItems = [
  { title: "Overview", href: "/admin", icon: Shield },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Verification", href: "/admin/kyc", icon: BadgeCheck },
  { title: "Properties", href: "/admin/properties", icon: House },
  { title: "Booking Queue", href: "/admin/bookings", icon: Calendar },
  { title: "Payments & Refunds", href: "/admin/payments", icon: CreditCard },
  { title: "Support Inbox", href: "/admin/support", icon: LifeBuoy },
  { title: "Reports", href: "/admin/reports", icon: FileChartColumn },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

const kycItems = [{ title: "Verification", href: "/dashboard/kyc", icon: ShieldCheck }];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const { setOpenMobile } = useSidebar();
  const closeMobileSidebar = React.useCallback(() => setOpenMobile(false), [setOpenMobile]);

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const items =
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
                  { title: "Rooms", href: "/dashboard/rooms", icon: BedDouble },
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
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    item.href !== "/admin" &&
                    pathname.startsWith(`${item.href}/`));

                const messageItem =
                  item.href === "/dashboard/messages" || item.href === "/admin/support";
                const label =
                  messageItem && unreadCount > 0
                    ? `${item.title}, ${unreadCount} unread messages`
                    : item.title;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link href={item.href} onClick={closeMobileSidebar} aria-label={label}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {messageItem && unreadCount > 0 ? (
                      <SidebarMenuBadge
                        aria-hidden="true"
                        className="rounded-full bg-destructive text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:text-[9px]"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </SidebarMenuBadge>
                    ) : null}
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
