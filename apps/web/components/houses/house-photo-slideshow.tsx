"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HousePhotoSlideshow({
  houseName,
  media,
  initialIndex = 0,
}: {
  houseName: string;
  media: string[];
  initialIndex?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex + 1);
  const [count, setCount] = useState(media.length);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.scrollTo(initialIndex, true);

    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    const onReInit = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", onSelect);
    api.on("reInit", onReInit);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api, initialIndex]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  if (media.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <Carousel setApi={setApi} opts={{ startIndex: initialIndex, loop: true }} className="w-full">
        <div className="relative">
          <CarouselContent className="ml-0">
            {media.map((src, index) => (
              <CarouselItem key={`${src}-${index}`} className="pl-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={src}
                    alt={`${houseName} photo ${index + 1}`}
                    fill
                    priority={index === initialIndex}
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 64rem"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {media.length > 1 ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Previous photo"
                onClick={() => api?.scrollPrev()}
                className="absolute top-1/2 left-3 size-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/95 text-slate-950 shadow-lg hover:bg-white"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Next photo"
                onClick={() => api?.scrollNext()}
                className="absolute top-1/2 right-3 size-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/95 text-slate-950 shadow-lg hover:bg-white"
              >
                <ChevronRight className="size-5" />
              </Button>
              <p
                aria-live="polite"
                className="absolute right-3 bottom-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white tabular-nums"
              >
                {current} / {count}
              </p>
            </>
          ) : null}
        </div>
      </Carousel>

      {media.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {media.map((src, index) => (
            <button
              key={`${src}-thumb-${index}`}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to photo ${index + 1}`}
              aria-current={current === index + 1}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg ring-offset-2 ring-offset-[#f7f5f0] transition-opacity dark:ring-offset-slate-950",
                current === index + 1 ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
