"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileVideo, ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  isPropertyMediaMimeType,
  isVideoMimeType,
  isVideoPropertyFile,
  MAX_PROPERTY_IMAGE_BYTES,
  MAX_PROPERTY_MEDIA_ITEMS,
  MAX_PROPERTY_VIDEO_BYTES,
  normalizePropertyMediaContentType,
  PROPERTY_MEDIA_MIME_TYPES,
} from "@/lib/property-media";

interface MediaDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
  description?: string;
}

function FilePreview({ file }: { file: File }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!objectUrl) return null;
  if (isVideoPropertyFile(file)) {
    return (
      <div className="relative h-full w-full bg-black">
        <video
          src={objectUrl}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          VIDEO
        </span>
      </div>
    );
  }
  return <img src={objectUrl} alt={file.name} className="h-full w-full object-cover" />;
}

export function MediaDropzone({
  value,
  onChange,
  maxFiles = MAX_PROPERTY_MEDIA_ITEMS,
  className,
  description = `JPG, PNG, WebP, AVIF, MP4, WebM or MOV. Max ${MAX_PROPERTY_MEDIA_ITEMS} files, 10 MB per photo, 100 MB per video.`,
}: MediaDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const valid = Array.from(incoming).filter((file) => {
        const contentType = normalizePropertyMediaContentType(file);
        if (!isPropertyMediaMimeType(contentType)) return false;
        const limit = isVideoMimeType(contentType)
          ? MAX_PROPERTY_VIDEO_BYTES
          : MAX_PROPERTY_IMAGE_BYTES;
        return file.size <= limit;
      });
      onChange([...value, ...valid].slice(0, maxFiles));
    },
    [value, onChange, maxFiles],
  );

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        <ImagePlus className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Drop photos or videos here or click to browse</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={[...PROPERTY_MEDIA_MIME_TYPES, "video/x-quicktime", ".mov"].join(",")}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((file, i) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              {isPropertyMediaMimeType(normalizePropertyMediaContentType(file)) ? (
                <FilePreview file={file} />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                  <FileVideo className="size-8 text-muted-foreground" />
                  <p className="w-full truncate text-xs font-medium">{file.name}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove file ${file.name}`}
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-100 shadow-lg transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
