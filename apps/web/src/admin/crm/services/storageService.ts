"use client";

import { createClient } from "@/lib/supabase/client";

export interface UploadAttachmentParams {
  file: File;
  entityType: string;
  entityId: string;
}

export interface UploadAttachmentResult {
  path: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

class StorageService {
  private bucket = "crm-attachments";

  async uploadAttachment({
    file,
    entityType,
    entityId,
  }: UploadAttachmentParams): Promise<UploadAttachmentResult> {
    const prefix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    const safeName = sanitizeFileName(file.name);
    const path = `${entityType}/${entityId}/${prefix}_${safeName}`;
    return this.uploadToPath(file, path);
  }

  /** Upload file to an exact path (e.g. from upload-url API). Optional signal to cancel. */
  async uploadToPath(
    file: File,
    path: string,
    options?: { signal?: AbortSignal }
  ): Promise<UploadAttachmentResult> {
    if (options?.signal?.aborted) {
      throw new Error("Upload cancelled");
    }
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (options?.signal?.aborted) {
      throw new Error("Upload cancelled");
    }
    if (error || !data) {
      throw new Error(error?.message || "Failed to upload file");
    }
    return { path: data.path };
  }

  async remove(path: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage.from(this.bucket).remove([path]);
    if (error) {
      throw new Error(error.message || "Failed to remove file");
    }
  }

  async createSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to create signed URL");
    }
    return data.signedUrl;
  }
}

export const storageService = new StorageService();
