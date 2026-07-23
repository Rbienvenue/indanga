import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Recommended } from "../home/recommended";


export function RecommendedHouses() {
  return (
    <section className="space-y-5">
      <div className="flex justify-end">
        
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