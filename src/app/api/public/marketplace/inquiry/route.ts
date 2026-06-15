import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  emailMatchesAcquireCookie,
  normalizeAcquireEmail,
  setAcquireEmailCookie,
} from "@/lib/marketplace/acquireEmailCookie";
import {
  fetchInterestsByEmail,
  INQUIRY_NAME,
  INQUIRY_SOURCE,
  registerAcquireInterest,
  upsertMarketplaceInquiryLead,
} from "@/lib/marketplace/acquireInterestsServer";

const MarketplaceInquirySchema = z.object({
  email: z.string().email(),
  listing_id: z.string().uuid(),
  listing_slug: z.string().min(1),
  listing_title: z.string().min(1),
  website: z.string().optional(),
});

const EmailQuerySchema = z.object({
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    const parsed = EmailQuerySchema.safeParse({ email });
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!emailMatchesAcquireCookie(request, parsed.data.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const interests = await fetchInterestsByEmail(supabase, parsed.data.email);

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Marketplace inquiry GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = MarketplaceInquirySchema.parse(body);

    if (validated.website) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const normalizedEmail = normalizeAcquireEmail(validated.email);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch";
    const pageUrl = `${baseUrl}/marketplace/${validated.listing_slug}`;
    const messageBody = [
      `Acquisition inquiry for "${validated.listing_title}" (slug: ${validated.listing_slug}, id: ${validated.listing_id}).`,
      `Page: ${pageUrl}`,
    ].join("\n");

    const supabase = createServiceRoleClient();
    const leadId = await upsertMarketplaceInquiryLead(supabase, normalizedEmail);

    const isNewInterest = await registerAcquireInterest(supabase, {
      leadId,
      email: normalizedEmail,
      listingId: validated.listing_id,
      listingSlug: validated.listing_slug,
      listingTitle: validated.listing_title,
    });

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        name: INQUIRY_NAME,
        email: normalizedEmail,
        subject: `Acquisition inquiry: ${validated.listing_title}`,
        message: messageBody,
        status: "new",
        source: INQUIRY_SOURCE,
        lead_id: leadId,
      } as never)
      .select("id")
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: messageError?.message ?? "Failed to create message" },
        { status: 500 }
      );
    }

    const interests = await fetchInterestsByEmail(supabase, normalizedEmail);
    const messageId = (message as { id: string }).id;

    const response = NextResponse.json(
      {
        id: messageId,
        lead_id: leadId,
        already_registered: !isNewInterest,
        interests,
      },
      { status: 201 }
    );

    setAcquireEmailCookie(response, normalizedEmail);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Marketplace inquiry submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
