import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="size-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
            <div className="size-48 rounded-full bg-primary/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl">
              Start Your Journey Today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-background/60 sm:text-lg">
              Join thousands of happy customers who trust INDANGA.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="rounded-full px-10 py-3 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
