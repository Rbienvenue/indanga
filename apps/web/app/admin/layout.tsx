"use client";

import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/user/side-bar";
import { Topbar } from "@/components/dashboard/topbar";
import { useSession } from "@/components/providers/session-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  if (session && session.user?.role !== "ADMIN") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <div className="flex-1 bg-muted/20 px-4 py-6 lg:px-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
