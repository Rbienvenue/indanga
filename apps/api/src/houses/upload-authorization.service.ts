import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { type KycStatus, type UserRole } from "@indanga/db";

import {
  countVideosInMediaUrls,
  isPropertyMediaMimeType,
  isPropertyVideoMimeType,
  maxBytesForPropertyMimeType,
  MAX_PROPERTY_MEDIA_ITEMS,
  MAX_PROPERTY_VIDEOS,
  normalizePropertyMediaMimeType,
  PROPERTY_UPLOAD_URL_EXPIRES_IN_SECONDS,
  StorageError,
  StorageService,
} from "src/storage/storage.service";
import { RequestPropertyUploadsDto } from "./dtos";

export interface PropertyUploadAuthorization {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  contentType: string;
  expiresIn: number;
}

@Injectable()
export class UploadAuthorizationService {
  constructor(private readonly storageService: StorageService) {}

  async authorize(
    userId: string,
    role: UserRole,
    kycStatus: KycStatus,
    data: RequestPropertyUploadsDto,
  ): Promise<PropertyUploadAuthorization[]> {
    this.assertUploader(role, kycStatus);

    const items = data.items.map((item) => ({
      filename: item.filename,
      size: item.size,
      contentType: normalizePropertyMediaMimeType(item.contentType, item.filename),
    }));

    const videoCount = items.filter((item) => isPropertyVideoMimeType(item.contentType)).length;
    if (videoCount > MAX_PROPERTY_VIDEOS) {
      throw new BadRequestException(`A property can have at most ${MAX_PROPERTY_VIDEOS} videos`);
    }

    for (const item of items) {
      if (!isPropertyMediaMimeType(item.contentType)) {
        throw new BadRequestException(`Unsupported media type: ${item.contentType}`);
      }
      if (item.size > maxBytesForPropertyMimeType(item.contentType)) {
        throw new BadRequestException(`File exceeds the size limit for ${item.contentType}`);
      }
    }

    const authorizations: PropertyUploadAuthorization[] = [];
    for (const item of items) {
      // Opaque server-generated key scoped to the uploader. The client
      // filename is never trusted as the final key.
      const key = this.storageService.buildHouseMediaKey(userId, item.contentType);
      const uploadUrl = await this.storageService.createPresignedPutUrl(
        key,
        item.contentType,
        PROPERTY_UPLOAD_URL_EXPIRES_IN_SECONDS,
      );
      authorizations.push({
        uploadUrl,
        publicUrl: this.storageService.publicUrlForKey(key),
        key,
        contentType: item.contentType,
        expiresIn: PROPERTY_UPLOAD_URL_EXPIRES_IN_SECONDS,
      });
    }

    return authorizations;
  }

  private assertUploader(role: UserRole, kycStatus: KycStatus) {
    if (role === "admin") return;
    if (role === "landlord" && kycStatus === "APPROVED") return;
    throw new ForbiddenException("complete ID verification to manage properties");
  }

  async resolveNewMediaUrls(userId: string, urls: string[]): Promise<string[]> {
    if (urls.length > MAX_PROPERTY_MEDIA_ITEMS) {
      throw new BadRequestException(
        `A property can have at most ${MAX_PROPERTY_MEDIA_ITEMS} media items`,
      );
    }
    if (countVideosInMediaUrls(urls) > MAX_PROPERTY_VIDEOS) {
      throw new BadRequestException(`A property can have at most ${MAX_PROPERTY_VIDEOS} videos`);
    }
    for (const url of urls) {
      const key = this.storageService.keyFromHouseMediaUrl(url);
      if (!key) {
        throw new BadRequestException("Media URL is not in the property storage");
      }
      if (!this.storageService.isHouseMediaKeyForUser(key, userId)) {
        throw new BadRequestException("Media URL is not in your upload namespace");
      }
      try {
        await this.storageService.verifyPersistedHouseMedia(key);
      } catch (error) {
        if (error instanceof StorageError) {
          throw new BadRequestException(error.message);
        }
        throw new BadRequestException("Could not verify uploaded media");
      }
    }
    return urls;
  }

  resolveExistingMediaUrls(currentMedia: string[], submitted?: string[]): string[] {
    if (submitted === undefined) return currentMedia;
    const owned = new Set(currentMedia);
    for (const url of submitted) {
      if (!owned.has(url)) {
        throw new BadRequestException("Existing media is not part of this property");
      }
      const key = this.storageService.keyFromHouseMediaUrl(url);
      if (!key) {
        throw new BadRequestException("Media URL is not in the property storage");
      }
    }
    return submitted;
  }
}
