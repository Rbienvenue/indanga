"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    Heart,
    CalendarCheck,
    Wallet,
    Star,
    UserRound,
    Settings,
    CircleHelp,
    LogOut,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/components/providers/session-provider";
import ThemeToggle from "@/components/providers/theme-toggle";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const mainItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Browse Houses",
        href: "/houses",
        icon: Search,
    },
    {
        title: "Favorites",
        href: "/favorites",
        icon: Heart,
    },
    {
        title: "My Bookings",
        href: "/bookings",
        icon: CalendarCheck,
    },
    {
        title: "Payments",
        href: "/payments",
        icon: Wallet,
    },
    {
        title: "Reviews",
        href: "/reviews",
        icon: Star,
    },
];

const accountItems = [
    {
        title: "Profile",
        href: "/profile",
        icon: UserRound,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

const supportItems = [
    {
        title: "Help Center",
        href: "/help",
        icon: CircleHelp,
    },
];

export default function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const session = useSession();
    const user = session?.user;

    async function handleLogout() {
        await signOut();
        router.push("/auth/login");
        router.refresh();
    }

    const renderItems = (
        items: {
            title: string;
            href: string;
            icon: any;
        }[]
    ) =>
        items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                "flex h-11 items-center gap-3 rounded-xl px-4 text-white transition-all duration-200",
                                active
                                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                                    : "hover:bg-sidebar-accent"
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });

    return (
        <Sidebar className="border-r-0 bg-sidebar text-sidebar-foreground">
            {/* Logo */}
            <SidebarHeader className="border-b border-white/10 p-0">
                <div className="px-4 pt-6">
                    <div className="rounded-3xl bg-white p-6 shadow-lg">
                        <Image
                            src="/logo.png"
                            alt="INDANGA"
                            width={90}
                            height={90}
                            className="mx-auto"
                        />

                        <h2 className="mt-4 text-center text-2xl font-bold text-primary">
                            INDANGA
                        </h2>

                        <p className="text-center text-sm text-muted-foreground">
                            Find Your Perfect Home
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6">
                {/* Main */}
                <SidebarGroup>
                    <SidebarGroupLabel className="mb-2 px-3 uppercase tracking-wider text-white/70">
                        Main
                    </SidebarGroupLabel>

                    <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
                </SidebarGroup>

                {/* Account */}
                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="mb-2 px-3 uppercase tracking-wider text-white/70">
                        Account
                    </SidebarGroupLabel>

                    <SidebarMenu>{renderItems(accountItems)}</SidebarMenu>
                </SidebarGroup>

                {/* Support */}
                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="mb-2 px-3 uppercase tracking-wider text-white/70">
                        Support
                    </SidebarGroupLabel>

                    <SidebarMenu>{renderItems(supportItems)}</SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Bottom */}
            <SidebarFooter className="space-y-4 border-t border-white/10 p-4">
                <Card className="border-0 bg-sidebar-accent p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="/avatar.jpg" />
                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <p className="font-semibold text-white">Bienvenue</p>
                            <p className="text-sm text-white/70">Tenant</p>
                        </div>
                    </div>
                </Card>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild onClick={handleLogout}>
                            <Link
                                href="/logout"
                                className="flex h-11 items-center gap-3 rounded-xl px-4 text-white transition-all duration-200 hover:bg-sidebar-accent"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                                {user?.name ? (
                                    <span className="truncate text-xs text-white/60">{user.name}</span>
                                ) : null}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}