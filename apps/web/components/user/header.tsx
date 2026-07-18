"use client";

import { Bell } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserHeader() {
  const session = useSession();
  const user = session?.user;
  const displayName = user?.name ?? "Guest";

  return (
    <div className="flex items-center justify-between w-[70vw]">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="cursor-pointer">
          {user?.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
          <AvatarFallback className="text-lg">
            {getInitials(displayName) || "G"}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-muted-foreground">Welcome back</p>

          <h1 className="text-xl font-bold">{displayName} 👋</h1>
        </div>
      </div>

      <button className="relative" type="button" aria-label="Notifications">
        <Bell className="h-7 w-7 cursor-pointer" />
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs">
          3
        </span>
      </button>
    </div>
  );
}
