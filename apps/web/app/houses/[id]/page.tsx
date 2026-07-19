import type { Metadata } from "next";

import { HouseDetails } from "@/components/houses/house-details";

export const metadata: Metadata = {
  title: "House details | INDANGA",
  description: "Explore a home and book your next place with INDANGA.",
};

export default async function HouseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <HouseDetails houseId={id} />;
}
