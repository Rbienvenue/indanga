"use client";

import * as React from "react";
import Link from "next/link";
import { House, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-8" aria-hidden />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-widest text-destructive uppercase">
            Something went wrong
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            We ran into an unexpected error
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Please try again. If the problem persists, return home or contact
            support at support@indanga.com.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground/70">
              Error reference: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full font-semibold sm:w-auto"
            onClick={() => reset()}
          >
            <RotateCcw aria-hidden />
            Try again
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full font-semibold sm:w-auto"
            asChild
          >
            <Link href="/">
              <House aria-hidden />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
