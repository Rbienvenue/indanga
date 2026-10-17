import { Skeleton } from "@/components/ui/skeleton";

export function HouseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-slate-950">
      <div className="h-18 border-b border-slate-900/8 dark:border-white/10" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-5 h-5 w-40" />
        <Skeleton className="h-72 w-full rounded-2xl sm:h-88 lg:h-96" />
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_32rem]">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-12 w-3/4" />
            <Skeleton className="mt-4 h-5 w-1/2" />
            <div className="mt-10 grid grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
            <Skeleton className="mt-10 h-40 w-full" />
          </div>
          <Skeleton className="hidden h-96 rounded-2xl lg:block" />
        </div>
      </main>
    </div>
  );
}
