"use client";

import Link from "next/link";
import { House, RotateCcw, TriangleAlert } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <TriangleAlert className="size-8" aria-hidden />
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-semibold tracking-widest text-destructive uppercase">
                Critical error
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                The application failed to load
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Something went wrong at the application level. Please refresh
                the page or return home.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 sm:w-auto"
              >
                <RotateCcw className="size-4" aria-hidden />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-background px-2.5 text-sm font-semibold transition-all hover:bg-primary hover:text-white sm:w-auto"
              >
                <House className="size-4" aria-hidden />
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
