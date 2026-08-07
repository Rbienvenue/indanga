"use client";

import { useSession } from "@/components/providers/session-provider";
import { PropertyFeed } from "@/components/houses/property-feed";

export default function PropertiesPage() {
  const session = useSession();
  const isAgent = session?.user?.role === "LANDLORD";

  return (
    <div className="flex min-h-screen flex-col">
      <PropertyFeed ownerId={isAgent ? session?.user?.id : undefined} />
    </div>
  );
}
