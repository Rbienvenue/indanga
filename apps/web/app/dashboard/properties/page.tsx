import type { Metadata } from "next";

import { PropertyFeed } from "@/components/houses/property-feed";

export const metadata: Metadata = {
  title: "Properties for rent | INDANGA",
  description: "Browse available houses and apartments for rent with INDANGA.",
};

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PropertyFeed />
    </div>
  );
}
