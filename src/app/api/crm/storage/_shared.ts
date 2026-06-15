import { createServiceRoleClient } from "@/lib/supabase/server";

export const CRM_ATTACHMENTS_BUCKET = "crm-attachments";

/** Reject path traversal and empty paths for CRM storage operations. */
export function assertSafeStoragePath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.startsWith("/")) {
    return null;
  }
  return trimmed;
}

function crmBucket() {
  return createServiceRoleClient().storage.from(CRM_ATTACHMENTS_BUCKET);
}

export async function uploadCrmObject(
  path: string,
  body: Buffer,
  contentType: string
) {
  return crmBucket().upload(path, body, { contentType, upsert: true });
}

export async function removeCrmObject(path: string) {
  return crmBucket().remove([path]);
}

export async function signedCrmUrl(path: string, expiresInSeconds: number) {
  return crmBucket().createSignedUrl(path, expiresInSeconds);
}
