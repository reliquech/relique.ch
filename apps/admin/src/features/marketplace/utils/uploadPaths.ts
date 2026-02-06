import {
  MARKETPLACE_TEMP_PREFIX,
  TEMP_FILENAME_SEPARATOR,
} from "@/features/marketplace/constants";

export type TempUploadInfo = {
  sessionId: string;
  timestamp: number;
  random: string;
  ext: string;
};

const TEMP_PATH_REGEX = new RegExp(
  `^${MARKETPLACE_TEMP_PREFIX.replace(/\//g, "\\/")}\\/([^/]+?)${TEMP_FILENAME_SEPARATOR}(\\d+)${TEMP_FILENAME_SEPARATOR}([a-z0-9]+)\\.([a-z0-9]+)$`,
  "i"
);

export function createTempUploadPath(sessionId: string, fileName: string) {
  const sanitizedSession = sessionId.replace(/[^a-zA-Z0-9-]/g, "");
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `${MARKETPLACE_TEMP_PREFIX}/${sanitizedSession}${TEMP_FILENAME_SEPARATOR}${timestamp}${TEMP_FILENAME_SEPARATOR}${random}.${ext}`;
}

export function parseTempUploadPath(path: string): TempUploadInfo | null {
  const match = TEMP_PATH_REGEX.exec(path);
  if (!match) return null;

  const sessionId = match[1] || "";
  const timestamp = Number(match[2]);
  const random = match[3] || "";
  const ext = match[4] || "";

  if (!sessionId || !Number.isFinite(timestamp) || !random || !ext) return null;

  return { sessionId, timestamp, random, ext };
}

export function isMarketplaceTempPath(path: string) {
  return Boolean(parseTempUploadPath(path));
}
