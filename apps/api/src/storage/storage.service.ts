import { File } from "node:buffer";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
