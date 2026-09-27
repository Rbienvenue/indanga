import type { House } from "@indanga/db";
import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export function PropertyVerificationBadge({
  status,
  className,
}: {
  status?: VerificationStatus | null;
  className?: string;
}) {
  if (!status) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 gap-1.5 rounded-md border px-2.5 text-xs font-semibold",
        verificationStyles[status],
        className,
      )}
    >
      <BadgeCheck aria-hidden="true" />
      {verificationLabels[status]}
    </Badge>
  );
}
