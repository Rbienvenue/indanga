"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AddPropertyForm } from "@/components/dashboard/properties/add-property-form";
import { useSession } from "@/components/providers/session-provider";

export default function AdminEditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session?.user?.role, router]);

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Property</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this property details.</p>
      </div>

      <AddPropertyForm houseId={params.id} />
    </div>
  );
}
