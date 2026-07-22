import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/user/side-bar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                <main className="mx-auto w-full">
                    {children}
                </main>
            </SidebarProvider>
        </TooltipProvider>
    )
}