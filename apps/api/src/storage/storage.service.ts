import { File } from "node:buffer";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromBuffer } from "file-type";
import { customAlphabet } from "nanoid";

import { env } from "src/lib/env";

export enum StorageBucket {
  HOUSE_MEDIA = "houses",
  PROFILE_PICTURES = "profiles",
  DOCUMENTS = "documents",
  PAYMENT_RECEIPTS = "payments",
}

export interface FileMetaData {
  url: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

export const HOUSE_MEDIA_PREFIX = StorageBucket.HOUSE_MEDIA;

export const PROPERTY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const PROPERTY_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-quicktime",
] as const;

export type PropertyMediaMimeType =
  | (typeof PROPERTY_IMAGE_MIME_TYPES)[number]
  | (typeof PROPERTY_VIDEO_MIME_TYPES)[number];

export const MAX_PROPERTY_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_PROPERTY_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_PROPERTY_MEDIA_ITEMS = 10;
export const MAX_PROPERTY_VIDEOS = 2;
export const PROPERTY_UPLOAD_URL_EXPIRES_IN_SECONDS = 5 * 60;

const EXTENSION_BY_MIME_TYPE: Record<PropertyMediaMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-quicktime": "mov",
};

export function isPropertyImageMimeType(mimeType: string): boolean {
  return (PROPERTY_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isPropertyVideoMimeType(mimeType: string): boolean {
  return (PROPERTY_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isPropertyMediaMimeType(mimeType: string): mimeType is PropertyMediaMimeType {
  return isPropertyImageMimeType(mimeType) || isPropertyVideoMimeType(mimeType);
}

export function maxBytesForPropertyMimeType(mimeType: string): number {
  return isPropertyVideoMimeType(mimeType) ? MAX_PROPERTY_VIDEO_BYTES : MAX_PROPERTY_IMAGE_BYTES;
}

export function normalizePropertyMediaMimeType(contentType: string, filename?: string): string {
  const type = contentType.trim().toLowerCase();
  if (type === "video/x-quicktime") return "video/quicktime";
  if (type === "" && filename?.toLowerCase().endsWith(".mov")) return "video/quicktime";
  return contentType;
}

const VIDEO_URL_SUFFIXES = [".mp4", ".webm", ".mov"];

/** Infer video items from storage URLs (server-generated keys carry the extension). */
export function countVideosInMediaUrls(urls: string[]): number {
  return urls.filter((url) => {
    const path = url.split(/[?#]/)[0].toLowerCase();
    return VIDEO_URL_SUFFIXES.some((suffix) => path.endsWith(suffix));
  }).length;
}

type FileUpload = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
};

type ErrorCode =
  | "FILE_NOT_FOUND"
  | "UPLOAD_FAILED"
  | "INVALID_FILE_TYPE"
  | "PERMISSION_DENIED"
  | "FILE_TOO_LARGE";

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

@Injectable()
export class StorageService {
  private readonly nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
  private readonly s3Client: S3Client;
  // 100 MB
  private readonly maxFileSize = 100 * 1024 * 1024;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      },
      region: "auto",
      endpoint: env.S3_ENDPOINT,
    });
  }
  async uploadFiles(
    files: (string | Buffer | File | ArrayBufferLike)[],
    options?: { bucket: StorageBucket; customName?: string },
  ): Promise<FileMetaData[]> {
    const results: FileMetaData[] = [];
    for (const file of files) {
      results.push(await this.uploadFile(file, options));
    }
    return results;
  }

  async uploadFile(
    file: string | Buffer | File | ArrayBufferLike,
    options?: { bucket: StorageBucket; customName?: string; orgId?: string },
  ): Promise<FileMetaData> {
    try {
      const fileUpload = await this.prepareFile(file, options?.customName);

      const key = options?.orgId
        ? `${options.orgId}/${options.bucket}/${fileUpload.filename}`
        : `${options?.bucket}/${fileUpload.filename}`;
      const url = `${env.STORAGE_URL}/${key}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Key: key,
          Body: fileUpload.buffer,
          ContentType: fileUpload.mimeType,
          Bucket: env.S3_BUCKET,
        }),
      );

      return {
        url,
        filename: fileUpload.filename,
        path: url,
        size: fileUpload.buffer.length,
        mimeType: fileUpload.mimeType,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError(
        `Failed to upload file: ${error instanceof Error ? error.message : error}`,
        "UPLOAD_FAILED",
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Key: key,
        Bucket: env.S3_BUCKET,
      }),
    );
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds = PROPERTY_UPLOAD_URL_EXPIRES_IN_SECONDS,
  ): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  buildHouseMediaKey(userId: string, mimeType: string): string {
    if (!isPropertyMediaMimeType(mimeType)) {
      throw new StorageError("Unsupported media type", "INVALID_FILE_TYPE");
    }
    const safeUserId = userId.replace(/[^A-Za-z0-9_-]/g, "");
    if (!safeUserId) {
      throw new StorageError("Invalid user id", "PERMISSION_DENIED");
    }
    const extension = EXTENSION_BY_MIME_TYPE[mimeType];
    return `${HOUSE_MEDIA_PREFIX}/${safeUserId}/${this.nanoid()}.${extension}`;
  }

  publicUrlForKey(key: string): string {
    return `${env.STORAGE_URL}/${key}`;
  }

  keyFromHouseMediaUrl(url: string): string | null {
    const prefix = `${env.STORAGE_URL}/${HOUSE_MEDIA_PREFIX}/`;
    if (url.startsWith(prefix)) return url.slice(`${env.STORAGE_URL}/`.length);
    return null;
  }

  isHouseMediaKeyForUser(key: string, userId: string): boolean {
    const safeUserId = userId.replace(/[^A-Za-z0-9_-]/g, "");
    if (!safeUserId) return false;
    return key.startsWith(`${HOUSE_MEDIA_PREFIX}/${safeUserId}/`);
  }

  async headHouseMediaObject(key: string): Promise<{ contentType?: string; size?: number }> {
    try {
      const result = await this.s3Client.send(
        new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
      );
      return { contentType: result.ContentType, size: result.ContentLength };
    } catch {
      throw new StorageError("Uploaded media was not found in storage", "FILE_NOT_FOUND");
    }
  }

  /**
   * Verify a directly-uploaded object before it is persisted on a property:
   * it exists, its Content-Type is allowed, and its size fits its type limit.
   */
  async verifyPersistedHouseMedia(key: string): Promise<void> {
    const head = await this.headHouseMediaObject(key);
    if (!head.contentType || !isPropertyMediaMimeType(head.contentType)) {
      throw new StorageError("Unsupported media type", "INVALID_FILE_TYPE");
    }
    const maxBytes = maxBytesForPropertyMimeType(head.contentType);
    if (head.size === undefined || head.size > maxBytes) {
      throw new StorageError("Uploaded media exceeds the size limit", "FILE_TOO_LARGE");
    }
  }

  private async prepareFile(
    file: string | Buffer | File | ArrayBufferLike,
    customName?: string,
  ): Promise<FileUpload> {
    if (typeof file === "string") {
      return this.prepareBase64File(file, customName);
    }
    if (file instanceof File) {
      return this.prepareFileObject(file, customName);
    }
    if (file instanceof Buffer) {
      return this.prepareBufferFile(file, customName);
    }
    throw new StorageError("Invalid file type", "INVALID_FILE_TYPE");
  }

  private async prepareBase64File(base64: string, customName?: string): Promise<FileUpload> {
    const buffer = Buffer.from(base64, "base64");
    this.validateSize(buffer.length);
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) throw new StorageError("Invalid file type", "INVALID_FILE_TYPE");

    return {
      buffer,
      mimeType: fileType.mime,
      filename: `${customName || this.nanoid()}.${fileType.ext}`,
    };
  }

  private async prepareFileObject(file: File, customName?: string): Promise<FileUpload> {
    this.validateSize(file.size);
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension);
    const shortId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4)();

    return {
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      filename: `${customName || baseName}(${shortId})${extension}`,
    };
  }

  private async prepareBufferFile(buffer: Buffer, customName?: string): Promise<FileUpload> {
    this.validateSize(buffer.length);
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) throw new StorageError("Invalid file type", "INVALID_FILE_TYPE");

    return {
      buffer,
      mimeType: fileType.mime,
      filename: `${customName || this.nanoid()}.${fileType.ext}`,
    };
  }

  private validateSize(size: number): void {
    if (size > this.maxFileSize) {
      throw new StorageError("file too large", "FILE_TOO_LARGE");
    }
  }
}
