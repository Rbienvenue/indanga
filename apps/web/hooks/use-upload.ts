import { useMutation } from "@tanstack/react-query";

import type { ApiResponse } from "@/@types";
import { fetcher } from "@/lib/fetcher";
import { getPropertyMediaError, normalizePropertyMediaContentType } from "@/lib/property-media";

export interface PropertyUploadAuthorization {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  contentType: string;
  expiresIn: number;
}

interface UploadPropertyMediaInput {
  files: File[];
  existingUrls?: string[];
}

/**
 * Upload property images/videos directly from the browser to storage:
 * validate client-side, request presigned PUT URLs from the API, then PUT
 * each file to its URL. Returns the public URLs in original file order.
 */
async function uploadPropertyMedia({
  files,
  existingUrls = [],
}: UploadPropertyMediaInput): Promise<string[]> {
  const error = getPropertyMediaError(files, existingUrls);
  if (error) throw new Error(error);

  const { data: authorizations } = await fetcher<ApiResponse<PropertyUploadAuthorization[]>>(
    "/properties/upload-authorizations",
    {
      method: "POST",
      body: JSON.stringify({
        items: files.map((file) => ({
          filename: file.name,
          contentType: normalizePropertyMediaContentType(file),
          size: file.size,
        })),
      }),
    },
  );
  if (authorizations.length !== files.length) {
    throw new Error("Upload authorization failed. Please try again.");
  }

  return Promise.all(
    files.map(async (file, index) => {
      const authorization = authorizations[index];
      const response = await fetch(authorization.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": authorization.contentType },
        body: file,
      });
      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}. Please try again.`);
      }
      return authorization.publicUrl;
    }),
  );
}

export function useUpload() {
  return useMutation({ mutationFn: uploadPropertyMedia });
}
