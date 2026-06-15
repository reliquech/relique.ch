import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { fetchInterestsByLeadId } from "@/lib/marketplace/acquireInterestsServer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { id } = await params;
    const supabase = createServiceRoleClient();
    const interests = await fetchInterestsByLeadId(supabase, id);

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Lead marketplace interests error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
