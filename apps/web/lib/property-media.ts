export const PROPERTY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const PROPERTY_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const PROPERTY_MEDIA_MIME_TYPES: readonly string[] = [
  ...PROPERTY_IMAGE_MIME_TYPES,
  ...PROPERTY_VIDEO_MIME_TYPES,
];

export const MAX_PROPERTY_MEDIA_ITEMS = 10;
export const MAX_PROPERTY_VIDEOS = 2;
export const MAX_PROPERTY_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_PROPERTY_VIDEO_BYTES = 100 * 1024 * 1024;

const VIDEO_URL_SUFFIXES = [".mp4", ".webm", ".mov"];

export function isVideoMimeType(mimeType: string): boolean {
  return (PROPERTY_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isPropertyMediaMimeType(mimeType: string): boolean {
  return (PROPERTY_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function normalizePropertyMediaContentType(file: Pick<File, "name" | "type">): string {
  const type = file.type.trim().toLowerCase();
  if (type === "video/x-quicktime") return "video/quicktime";
  if (type === "" && file.name.toLowerCase().endsWith(".mov")) return "video/quicktime";
  return file.type;
}

/** Whether a selected file is a video, after QuickTime normalization. */
export function isVideoPropertyFile(file: Pick<File, "name" | "type">): boolean {
  return isVideoMimeType(normalizePropertyMediaContentType(file));
}

/** Uploaded media keys carry the extension, so list/detail views can tell videos apart. */
export function isVideoMediaUrl(url: string): boolean {
  const path = url.split(/[?#]/)[0].toLowerCase();
  return VIDEO_URL_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

export function countVideosInMediaUrls(urls: string[]): number {
  return urls.filter(isVideoMediaUrl).length;
}

/** Listing cover: the first image, falling back to the existing placeholder. */
export function firstImageUrl(media: string[] | undefined, fallback = "/image2.jpeg"): string {
  return media?.find((url) => !isVideoMediaUrl(url)) ?? fallback;
}

export function getPropertyMediaError(
  newFiles: File[],
  existingUrls: string[] = [],
): string | null {
  if (newFiles.length + existingUrls.length > MAX_PROPERTY_MEDIA_ITEMS) {
    return `A property can have at most ${MAX_PROPERTY_MEDIA_ITEMS} photos and videos`;
  }
  for (const file of newFiles) {
    const contentType = normalizePropertyMediaContentType(file);
    if (!isPropertyMediaMimeType(contentType)) {
      return `"${file.name}" is not supported. Use JPG, PNG, WebP, AVIF, MP4, WebM or MOV.`;
    }
    const limit = isVideoMimeType(contentType)
      ? MAX_PROPERTY_VIDEO_BYTES
      : MAX_PROPERTY_IMAGE_BYTES;
    if (file.size > limit) {
      const limitMb = Math.round(limit / (1024 * 1024));
      return `"${file.name}" exceeds the ${limitMb} MB limit`;
    }
  }
  const videoCount =
    countVideosInMediaUrls(existingUrls) +
    newFiles.filter((file) => isVideoMimeType(normalizePropertyMediaContentType(file))).length;
  if (videoCount > MAX_PROPERTY_VIDEOS) {
    return `A property can have at most ${MAX_PROPERTY_VIDEOS} videos`;
  }
  return null;
}
