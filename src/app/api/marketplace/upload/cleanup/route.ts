import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import {
  MARKETPLACE_UPLOAD_BUCKET,
  MARKETPLACE_TEMP_PREFIX,
  TEMP_UPLOAD_TTL_MS,
} from "@/features/marketplace/constants";
import { isMarketplaceTempPath, parseTempUploadPath } from "@/features/marketplace/utils/uploadPaths";

type CleanupPayload = {
  paths?: string[];
  cleanupStale?: boolean;
};

const LIST_LIMIT = 1000;

async function listTempObjects(client: ReturnType<typeof createServiceRoleClient>) {
  const bucket = client.storage.from(MARKETPLACE_UPLOAD_BUCKET);
  const objects: string[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await bucket.list(MARKETPLACE_TEMP_PREFIX, {
      limit: LIST_LIMIT,
      offset,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) break;

    data.forEach((item) => {
      if (item.name) {
        objects.push(`${MARKETPLACE_TEMP_PREFIX}/${item.name}`);
      }
    });

    if (data.length < LIST_LIMIT) {
      hasMore = false;
    } else {
      offset += LIST_LIMIT;
    }
  }

  return objects;
}

function getStaleTempPaths(paths: string[]) {
  const now = Date.now();
  return paths.filter((path) => {
    const info = parseTempUploadPath(path);
    if (!info) return false;
    return now - info.timestamp > TEMP_UPLOAD_TTL_MS;
  });
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const body = (await request.json().catch(() => ({}))) as CleanupPayload;

    const requestedPaths = Array.isArray(body.paths)
      ? body.paths.filter((path) => typeof path === "string" && isMarketplaceTempPath(path))
      : [];

    const stalePaths = body.cleanupStale
      ? getStaleTempPaths(await listTempObjects(supabase))
      : [];

    const pathsToRemove = Array.from(new Set([...requestedPaths, ...stalePaths]));

    if (pathsToRemove.length === 0) {
      return NextResponse.json({ removed: 0, staleRemoved: 0 }, { status: 200 });
    }

    const { error } = await supabase.storage
      .from(MARKETPLACE_UPLOAD_BUCKET)
      .remove(pathsToRemove);

    if (error) {
      return NextResponse.json(
        { error: "Failed to remove temporary uploads", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        removed: requestedPaths.length,
        staleRemoved: stalePaths.length,
        totalRemoved: pathsToRemove.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cleaning up temporary uploads:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
