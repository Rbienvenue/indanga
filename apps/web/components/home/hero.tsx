"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { image: "/family-house.jpg", alt: "A welcoming home" },
  { image: "/slide-4.jpg", alt: "A modern living space" },
  { image: "/hotel room 1.jpg", alt: "A modern living space" },
  { image: "/hotel room 2.jpg", alt: "A modern living space" }
];

const words = ["Stay", "Home", "Ride"];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let delay = isDeleting ? 60 : 120;

    if (!isDeleting && displayText === currentWord) {
      delay = 1800;
    } else if (isDeleting && displayText === "") {
      delay = 400;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentWord) {
        setIsDeleting(true);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setWordIndex((current) => (current + 1) % words.length);
      } else {
        setDisplayText(
          isDeleting
            ? currentWord.slice(0, displayText.length - 1)
            : currentWord.slice(0, displayText.length + 1)
        );
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

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
          <span
            aria-live="polite"
            className="inline-block min-h-[1.2em] min-w-[4ch]"
          >
            {displayText}
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-white align-[-0.1em]"
            />
          </span>
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
          Search verified homes, hotels, and cars  all in one place.
        </p>
      </div>
    </section>
  );
}
