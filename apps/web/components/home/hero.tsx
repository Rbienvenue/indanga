import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Cover Image */}
      <Image
        src="/hero.jpg"
        alt="Kigali cityscape at sunset"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        quality={90}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-18 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-start">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.1]">
            One Platform.
            <br />
            Endless Possibilities.
            <br />
            Your Journey, <span className="italic text-primary">Simplified.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg md:text-xl">
            Find your next home, book the perfect hotel, or rent a car — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg">Explore Now</Button>
            <Button variant="outline" size="lg">
              <Play className="mr-1.5 size-4 fill-current" />
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
