import { PropertyFeed } from "@/components/houses/property-feed";

const initialFilters = {
  location: "all",
  propertyType: "all",
  budget: "any",
} as const;

export default function HousesPage() {
  return <PropertyFeed initialFilters={initialFilters} />;
}
