import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { VerifyResultSchema } from "@/lib/domain";
import { lookupMarketplaceItemByCode } from "@/lib/verify/lookupCode";
import { mapMarketplaceToVerifyResult } from "@/lib/verify/mapMarketplaceToResult";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")?.trim();
    if (!code) {
      return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const row = await lookupMarketplaceItemByCode(supabase, code);

    if (!row) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const result = mapMarketplaceToVerifyResult(row, code.toUpperCase());
    const validated = VerifyResultSchema.safeParse(result);
    if (!validated.success) {
      console.error("VerifyResult validation failed:", validated.error);
      return NextResponse.json({ error: "Invalid verify result shape" }, { status: 500 });
    }

    return NextResponse.json({ found: true, result: validated.data });
  } catch (error) {
    console.error("Verify lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
