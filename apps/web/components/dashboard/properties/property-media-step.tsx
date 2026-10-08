"use client";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { MediaDropzone } from "@/components/ui/media-dropzone";
import { isVideoMediaUrl, MAX_PROPERTY_MEDIA_ITEMS } from "@/lib/property-media";
export function PropertyMediaStep({
  files,
  setFiles,
  existingMedia,
  setExistingMedia,
}: {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  existingMedia: string[];
  setExistingMedia: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <div className="space-y-2">
      <Label>Photos and videos</Label>
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {existingMedia.map((src) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              {isVideoMediaUrl(src) ? (
                <video
                  src={src}
                  preload="metadata"
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img src={src} alt="Property photo" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setExistingMedia((media) => media.filter((url) => url !== src))}
                aria-label="Remove media"
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-100 shadow-lg transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <MediaDropzone
        value={files}
        onChange={setFiles}
        maxFiles={MAX_PROPERTY_MEDIA_ITEMS - existingMedia.length}
      />
    </div>
  );
}
