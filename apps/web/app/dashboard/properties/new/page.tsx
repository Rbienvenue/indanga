"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AddPropertyForm } from "@/components/dashboard/properties/add-property-form";
import { useSession } from "@/components/providers/session-provider";

export default function NewPropertyPage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== "LANDLORD") {
      router.replace("/dashboard");
    }
  }, [session?.user?.role, router]);

  if (session?.user?.role !== "LANDLORD") {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Property</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          List a new property for tenants to discover and book.
        </p>
      </div>

      <AddPropertyForm />
    </div>
  );
}
