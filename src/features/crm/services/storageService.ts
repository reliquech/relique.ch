"use client";

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

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  return data.error ?? fallback;
}

class StorageService {
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

    const formData = new FormData();
    formData.set("file", file);
    formData.set("path", path);

    const response = await fetch("/api/crm/storage/upload", {
      method: "POST",
      body: formData,
      signal: options?.signal,
    });

    if (options?.signal?.aborted) {
      throw new Error("Upload cancelled");
    }

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to upload file"));
    }

    return (await response.json()) as UploadAttachmentResult;
  }

  async remove(path: string): Promise<void> {
    const response = await fetch("/api/crm/storage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to remove file"));
    }
  }

  async createSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const params = new URLSearchParams({
      path,
      expiresIn: String(expiresInSeconds),
    });
    const response = await fetch(`/api/crm/storage/signed-url?${params.toString()}`);

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to create signed URL"));
    }

    const data = (await response.json()) as { signedUrl: string };
    return data.signedUrl;
  }
}

export const storageService = new StorageService();
