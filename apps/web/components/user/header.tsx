import { Bell } from "lucide-react";
import Image from "next/image";

export default function UserHeader() {
    return (
        <div className="flex items-center justify-between w-[70vw]">
            <div className="flex items-center gap-4">
                <Image
                    src="/avatar.png"
                    alt="Profile"
                    width={72}
                    height={72}
                    className="rounded-full cursor-pointer"
                />

                <div>
                    <p className="text-muted-foreground">
                        Welcome back
                    </p>

                    <h1 className="text-3xl font-bold">
                        Jean Claude 👋
                    </h1>
                </div>
            </div>

            <button className="relative">
                <Bell className="h-7 w-7 cursor-pointer" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs">
                    3
                </span>
            </button>
        </div>
    )
}