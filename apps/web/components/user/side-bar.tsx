import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Calendar,
    Heart,
    MessageSquare,
    CreditCard,
    User,
    LifeBuoy,
    LogOut,
    LucideLogOut,
} from "lucide-react"

import Link from "next/link"

const items = [
    {
        title: "Dashboard",
        url: "/user-dashboard",
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
        title: "Messages",
        url: "/messages",
        icon: MessageSquare,
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
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="bg-[#0A0A2C] text-white">
            <SidebarMenuButton size="lg" className="bg-[#0A0A2C] rounded-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    I
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">INDANGA</span>
                    <span className="truncate text-xs">Hotels & Tours</span>
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
                <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-red-600">
                        <LucideLogOut />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Logout</span>
                    </div>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    )
}