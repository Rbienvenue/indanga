"use client";

import type { House } from "@indanga/db";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type VerificationStatus = NonNullable<House["verificationStatus"]>;

const verificationStyles: Record<VerificationStatus, string> = {
  ReviewedByIndanga:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  VerifiedByIndanga:
    "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
};

const verificationLabels: Record<VerificationStatus, string> = {
  ReviewedByIndanga: "Reviewed by INDANGA",
  VerifiedByIndanga: "Verified by INDANGA",
};

const verificationDescriptions: Record<VerificationStatus, string> = {
  ReviewedByIndanga:
    "We checked the information submitted by the provider before publishing this listing. Prices and availability can change, so review the latest details before booking.",
  VerifiedByIndanga:
    "INDANGA checked the provider’s identity and reviewed key listing information, including the location, photos, pricing, and availability.",
};

export function PropertyVerificationBadge({
  status,
  listingStatus,
  className,
  lastReviewed,
}: {
  status?: VerificationStatus | null;
  listingStatus: House["status"];
  className?: string;
  lastReviewed?: string | Date | null;
}) {
  if (!status || listingStatus === "PENDING") return null;

  const reviewedLabel = lastReviewed
    ? `${status === "VerifiedByIndanga" ? "Verified" : "Reviewed"} on ${new Date(lastReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${verificationLabels[status]} — learn what this means`}
          title="What does this mean?"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <Badge
            variant="secondary"
            className={cn(
              "h-6 gap-1.5 rounded-md border px-2.5 text-xs font-semibold",
              verificationStyles[status],
            )}
          >
            <BadgeCheck aria-hidden="true" />
            {verificationLabels[status]}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <PopoverTitle>{verificationLabels[status]}</PopoverTitle>
        <PopoverDescription>{verificationDescriptions[status]}</PopoverDescription>
        {reviewedLabel ? (
          <p className="text-xs font-semibold text-foreground">{reviewedLabel}</p>
        ) : null}
        <p className="text-xs leading-5 text-muted-foreground">
          Verification does not guarantee future availability, unchanged pricing, or the quality of
          every service. Review the listing and booking terms before making a payment.
        </p>
        <Link
          href="/support#faqs"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Learn more in the Support Center
        </Link>
      </PopoverContent>
    </Popover>
  );
}
