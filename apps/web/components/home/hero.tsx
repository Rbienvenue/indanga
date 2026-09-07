"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { image: "/family-house.jpg", alt: "A welcoming home" },
  { image: "/slide-4.jpg", alt: "A modern living space" },
  { image: "/hotel room 1.jpg", alt: "A modern living space" },
  { image: "/hotel room 2.jpg", alt: "A modern living space" }
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden pt-18 pb-14">
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            activeSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            quality={90}
          />
        </div>
      ))}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/40" />
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" />

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
