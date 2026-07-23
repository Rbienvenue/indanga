import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-32 items-start gap-3 p-5">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
