import type { NextRequest, NextResponse } from "next/server";

export const ACQUIRE_EMAIL_COOKIE = "acquire_email";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function normalizeAcquireEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function readAcquireEmailCookie(request: NextRequest): string | null {
  const value = request.cookies.get(ACQUIRE_EMAIL_COOKIE)?.value;
  return value ? normalizeAcquireEmail(value) : null;
}

export function setAcquireEmailCookie(response: NextResponse, email: string): void {
  response.cookies.set(ACQUIRE_EMAIL_COOKIE, normalizeAcquireEmail(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export function emailMatchesAcquireCookie(
  request: NextRequest,
  email: string
): boolean {
  const cookieEmail = readAcquireEmailCookie(request);
  if (!cookieEmail) return false;
  return cookieEmail === normalizeAcquireEmail(email);
}
