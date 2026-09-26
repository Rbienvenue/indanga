import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, House, SearchX } from "lucide-react";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found | INDANGA",
  description:
    "The page you are looking for does not exist or has been moved. Explore homes, hotels, and cars on INDANGA.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar solid />
      <main className="flex flex-1 items-center justify-center px-4 pt-18 pb-16 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX className="size-8" aria-hidden />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              404 &mdash; Page not found
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              We couldn&rsquo;t find that page
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              The link you followed may be broken, or the page may have been
              removed. Let&rsquo;s get you back to finding your next home,
              hotel, or car.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full font-semibold sm:w-auto" asChild>
              <Link href="/">
                <House aria-hidden />
                Back to home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold sm:w-auto"
              asChild
            >
              <Link href="/properties">
                <ArrowLeft aria-hidden />
                Explore properties
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
