"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/components/providers/session-provider";
import { signOut } from "@/lib/auth-client";
import ThemeToggle from "@/components/providers/theme-toggle";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface UserAvatarProps {
  showDashboard?: boolean;
  showThemeToggle?: boolean;
}

export function UserAvatar({ showDashboard = true, showThemeToggle = false }: UserAvatarProps) {
  const t = useTranslations("navigation");
  const common = useTranslations("common");
  const router = useRouter();
  const session = useSession();
  const user = session?.user;
  const displayName = user?.name ?? common("guest");
  const initials = getInitials(displayName) || "G";

  if (!session) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg" className="gap-2">
          <Avatar>
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-gray-900 dark:text-white text-sm font-medium sm:inline">
            {displayName.split(" ")[0]}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p>{displayName}</p>
            <p className="text-xs font-normal text-muted-foreground">{user?.email ?? ""}</p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          {showDashboard && (
            <>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                {t("dashboard")}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            {t("profile")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {showThemeToggle ? (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span className="text-sm">{common("theme")}</span>
              <ThemeToggle />
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () =>
            signOut({
              fetchOptions: {
                onSuccess: () => router.replace("/auth/login"),
              },
            })
          }
        >
          <LogOut className="size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
