import type { Metadata } from "next";

import { HouseDetails } from "@/components/houses/house-details";

export const metadata: Metadata = {
  title: "Property details | INDANGA",
  description: "Explore a property and book your next place with INDANGA.",
};

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <HouseDetails houseId={id} />;
}
