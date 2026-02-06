import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import {
  MARKETPLACE_PERM_PREFIX,
  MARKETPLACE_UPLOAD_BUCKET,
} from "@/features/marketplace/constants";
import { isMarketplaceTempPath, parseTempUploadPath } from "@/features/marketplace/utils/uploadPaths";

type FinalizePayload = {
  paths?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const body = (await request.json().catch(() => ({}))) as FinalizePayload;

    const requestedPaths = Array.isArray(body.paths)
      ? body.paths.filter((path) => typeof path === "string" && isMarketplaceTempPath(path))
      : [];
    const uniquePaths = Array.from(new Set(requestedPaths));

    if (uniquePaths.length === 0) {
      return NextResponse.json({ error: "No temporary uploads to finalize" }, { status: 400 });
    }

    const bucket = supabase.storage.from(MARKETPLACE_UPLOAD_BUCKET);
    const results = await Promise.allSettled(
      uniquePaths.map(async (path) => {
        const info = parseTempUploadPath(path);
        if (!info) {
          throw new Error("Invalid temporary path");
        }

        const destination = `${MARKETPLACE_PERM_PREFIX}/${info.sessionId}/${info.timestamp}-${info.random}.${info.ext}`;
        const { error } = await bucket.move(path, destination);

        if (error) {
          throw new Error(error.message);
        }

        const {
          data: { publicUrl },
        } = bucket.getPublicUrl(destination);

        return { from: path, to: destination, url: publicUrl };
      })
    );

    const files = results
      .filter(
        (result): result is PromiseFulfilledResult<{ from: string; to: string; url: string }> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);
    const errors = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ result, index }) => ({
        path: uniquePaths[index],
        message: (result as PromiseRejectedResult).reason instanceof Error
          ? (result as PromiseRejectedResult).reason.message
          : "Failed to finalize upload",
      }));

    return NextResponse.json(
      {
        files,
        errors,
      },
      { status: errors.length > 0 ? 207 : 200 }
    );
  } catch (error) {
    console.error("Error finalizing marketplace uploads:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
