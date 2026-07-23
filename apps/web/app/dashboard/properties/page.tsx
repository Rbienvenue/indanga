import type { Metadata } from "next";

import type { PropertySearchValues } from "@/components/home/search-bar";
import { PropertyFeed } from "@/components/houses/property-feed";

export const metadata: Metadata = {
  title: "Properties for rent | INDANGA",
  description: "Browse available houses and apartments for rent with INDANGA.",
};


export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string  | undefined>>;
}) {
  const params = await searchParams;
  const initialFilters: PropertySearchValues = {
    location: params.location ?? "all",
    propertyType: params.type ?? "all",
    budget: params.budget ?? "any",
  };

  return (
    <div className="flex min-h-screen flex-col">

      <PropertyFeed initialFilters={initialFilters} />
    </div>
  );
}
