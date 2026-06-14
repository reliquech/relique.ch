import { NextRequest, NextResponse } from "next/server";

/**
 * Public self-service registration is disabled (SEC-01).
 * Operators create users via /api/users (admin invite) only.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: "Public registration is disabled. Contact an administrator for access.",
    },
    { status: 403 }
  );
}
