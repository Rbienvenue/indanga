import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Recommended } from "../home/recommended";


export function RecommendedHouses() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Recommended For You
          </h2>

          <p className="text-sm text-muted-foreground">
            Based on your favorites, location and budget.
          </p>
        </div>

        <Button asChild variant="ghost">
          <Link href="/houses">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Recommended/>
    </section>
  );
}