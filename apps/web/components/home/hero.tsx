import Image from "next/image";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-18 pb-14">
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      {/* Content – centered heading */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          Find Your Perfect
          <br />
          Stay, Home or Ride
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
          Search verified homes, hotels, and cars  all in one place.
        </p>
      </div>
    </section>
  );
}
