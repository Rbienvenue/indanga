"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import type { House } from "@/@types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HousePhotoSlideshow } from "./house-photo-slideshow";
import { isVideoMediaUrl } from "@/lib/property-media";
import { cn } from "@/lib/utils";
export function PropertyGallery({ house }: { house: House }) {
  const t = useTranslations("properties");
  const media = house.media.length > 0 ? house.media : [];
  const images =
    media.length > 0 ? Array.from({ length: 5 }, (_, index) => media[index % media.length]) : [];
  const hasVideos = media.some(isVideoMediaUrl);
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  function openSlideshow(index: number) {
    setInitialIndex(index);
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="relative grid h-[18rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[22rem] lg:h-[24rem]">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => openSlideshow(index % media.length)}
            className={cn(
              "group relative overflow-hidden bg-muted text-left",
              index === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block",
            )}
          >
            {isVideoMediaUrl(src) ? (
              <video
                src={src}
                preload="metadata"
                muted
                playsInline
                aria-label={t("propertyVideo", { name: house.name, index: index + 1 })}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={src}
                alt={t("propertyImage", { name: house.name, index: index + 1 })}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "25vw"}
              />
            )}
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => openSlideshow(0)}
          className="absolute right-4 bottom-4 z-10 h-10 border border-black/10 bg-white/95 px-4 text-slate-950 shadow-lg hover:bg-white"
        >
          <Maximize2 />
          {hasVideos ? t("allMedia") : t("allPhotos")}
        </Button>
      </div>

      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-[#f7f5f0] p-5 dark:bg-slate-950 sm:max-w-5xl">
        <DialogTitle className="text-xl">{house.name}</DialogTitle>
        {open ? (
          <HousePhotoSlideshow
            key={initialIndex}
            houseName={house.name}
            media={media}
            initialIndex={initialIndex}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
