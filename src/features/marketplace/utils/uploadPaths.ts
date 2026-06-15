import {
  MARKETPLACE_PERM_PREFIX,
  MARKETPLACE_TEMP_PREFIX,
  TEMP_FILENAME_SEPARATOR,
} from "@/features/marketplace/constants";

export type TempUploadInfo = {
  sessionId: string;
  timestamp: number;
  random: string;
  ext: string;
};

const LEGACY_TEMP_PATH_REGEX = new RegExp(
  `^${MARKETPLACE_TEMP_PREFIX.replace(/\//g, "\\/")}\\/([^/]+?)${TEMP_FILENAME_SEPARATOR}(\\d+)${TEMP_FILENAME_SEPARATOR}([a-z0-9]+)\\.([a-z0-9]+)$`,
  "i"
);

const STAGING_PATH_REGEX = new RegExp(
  `^${MARKETPLACE_PERM_PREFIX.replace(/\//g, "\\/")}\\/([^/]+)\\/(\\d+)-([a-z0-9]+)\\.([a-z0-9]+)$`,
  "i"
);

/** Upload directly under marketplace/items/{session}/ — no tmp→move finalize step. */
export function createTempUploadPath(sessionId: string, fileName: string) {
  const sanitizedSession = sessionId.replace(/[^a-zA-Z0-9-]/g, "");
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `${MARKETPLACE_PERM_PREFIX}/${sanitizedSession}/${timestamp}-${random}.${ext}`;
}

function parseLegacyTempUploadPath(path: string): TempUploadInfo | null {
  const match = LEGACY_TEMP_PATH_REGEX.exec(path);
  if (!match) return null;

  const sessionId = match[1] || "";
  const timestamp = Number(match[2]);
  const random = match[3] || "";
  const ext = match[4] || "";

  if (!sessionId || !Number.isFinite(timestamp) || !random || !ext) return null;

  return { sessionId, timestamp, random, ext };
}

function parseStagingUploadPath(path: string): TempUploadInfo | null {
  const match = STAGING_PATH_REGEX.exec(path);
  if (!match) return null;

  const sessionId = match[1] || "";
  const timestamp = Number(match[2]);
  const random = match[3] || "";
  const ext = match[4] || "";

  if (!sessionId || !Number.isFinite(timestamp) || !random || !ext) return null;

  return { sessionId, timestamp, random, ext };
}

export function parseTempUploadPath(path: string): TempUploadInfo | null {
  return parseStagingUploadPath(path) ?? parseLegacyTempUploadPath(path);
}

export function isMarketplaceTempPath(path: string) {
  return Boolean(parseTempUploadPath(path));
}

export function isLegacyTempUploadPath(path: string) {
  return Boolean(parseLegacyTempUploadPath(path));
}

export function isStagingUploadPath(path: string) {
  return Boolean(parseStagingUploadPath(path));
}
