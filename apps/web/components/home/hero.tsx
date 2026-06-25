import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-16 sm:px-6 md:gap-12 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
        {/* Left Content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
            One Platform.
            <br />
            Endless Possibilities.
            <br />
            Your Journey,{" "}
            <span className="italic text-primary">Simplified.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-background/60 sm:text-lg">
            Find your next home, book the perfect hotel, or rent a car — all in
            one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 py-3 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Explore Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-background/20 bg-transparent px-6 py-3 text-base font-medium text-background hover:bg-background/10 hover:text-background"
            >
              <Play className="mr-1 size-4 fill-current" />
              How It Works
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative flex-1">
          <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl lg:max-w-none">
            <Image
              src="/image1.jpeg"
              alt="Beautiful luxury home"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Glow effect */}
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-primary/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
