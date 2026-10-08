"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AddPropertyForm } from "@/components/dashboard/properties/add-property-form";
import { useSession } from "@/components/providers/session-provider";

export default function NewPropertyPage() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") ?? searchParams.get("houseId") ?? undefined;
  const isEditMode = !!propertyId;
  const listingLabel =
    session?.user.providerType === "CAR"
      ? "vehicle"
      : session?.user.providerType === "HOUSE"
        ? "house"
        : "hotel";

  useEffect(() => {
    if (session?.user?.role !== "landlord") {
      router.replace("/dashboard");
    }
  }, [session?.user?.role, router]);

  if (session?.user?.role !== "landlord") {
    return null;
  }

  return (
    <div className="w-full space-y-8 rounded-lg border border-border px-3 py-2 sm:px-6 sm:py-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditMode ? "Edit listing" : `Add ${listingLabel}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode
            ? "Update your property details."
            : `List a new ${listingLabel} for customers to discover and book.`}
        </p>
      </div>

      <AddPropertyForm houseId={propertyId} />
    </div>
  );
}
