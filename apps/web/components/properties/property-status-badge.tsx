import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PropertyStatus = "PENDING" | "AVAILABLE" | "BOOKED" | "SOLD";

const statusStyles: Record<PropertyStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  AVAILABLE: "bg-green-100 text-green-700",
  SOLD: "bg-slate-100 text-slate-700",
  BOOKED: "bg-blue-100 text-blue-700",
};

export function PropertyStatusBadge({
  status,
  className,
}: {
  status: PropertyStatus;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
