import type { VerifyStatus } from "@/lib/domain";
import { VerifyResultSchema } from "@/lib/domain";
import type { z } from "zod";

type VerifyResult = z.infer<typeof VerifyResultSchema>;

function parseJson(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return null;
}

function mapAuthStatusToVerifyStatus(authStatus: string | undefined): VerifyStatus {
  const s = (authStatus ?? "").toLowerCase();
  if (["verified", "authenticated", "approved"].includes(s)) return "qualified";
  if (["rejected", "failed", "disputed", "disqualified"].includes(s)) return "disqualified";
  if (["pending", "under_review", "inconclusive"].includes(s)) return "inconclusive";
  return "inconclusive";
}

function formatIsoDate(value: unknown): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function signerNamesFromSigning(signing: Record<string, unknown> | null): string[] {
  const signers = signing?.signers;
  if (!Array.isArray(signers)) return [];
  return signers
    .map((s) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object" && "name" in s) return String((s as { name: string }).name);
      return null;
    })
    .filter((n): n is string => Boolean(n));
}

export function mapMarketplaceToVerifyResult(
  row: Record<string, unknown>,
  lookupCode: string
): VerifyResult {
  const listing = parseJson(row.listing);
  const signing = parseJson(row.signing);
  const condition = parseJson(row.condition);
  const auth = parseJson(row.auth);
  const media = parseJson(row.media);
  const state = parseJson(row.state);

  const authStatus = auth?.status ? String(auth.status) : undefined;
  const status = mapAuthStatusToVerifyStatus(authStatus);
  const coaRefs = Array.isArray(auth?.coa_refs) ? auth.coa_refs.map(String) : [];
  const certificate = coaRefs[0] ?? lookupCode;
  const productId = row.product_id ? String(row.product_id) : lookupCode;
  const itemName = listing?.title ? String(listing.title) : "Unknown Item";
  const signers = signerNamesFromSigning(signing);
  const signatures = signers.length || (typeof signing?.signature_count === "number" ? signing.signature_count : 0);
  const analysisDate = formatIsoDate(state?.updated_at ?? row.updated_at ?? row.created_at);

  const lifecycle = row.state_lifecycle ?? state?.lifecycle;
  const visibility = row.state_visibility ?? state?.visibility;
  const slug = row.slug ? String(row.slug) : undefined;
  const isPublished =
    String(lifecycle) === "published" && (visibility == null || String(visibility) === "public");

  const heroImageUrl = media?.hero_id ? String(media.hero_id) : undefined;
  const galleryImageUrls = Array.isArray(media?.gallery)
    ? media.gallery.map(String).filter(Boolean)
    : undefined;

  const result = VerifyResultSchema.parse({
    productId,
    itemName,
    signatures: Number(signatures) || 0,
    status,
    date: analysisDate,
    certificate,
    authenticationResult:
      status === "qualified"
        ? "Authenticated"
        : status === "disqualified"
          ? "Disqualified"
          : "Inconclusive",
    dateOfAnalysis: analysisDate,
    signerNames: signers.length ? signers : undefined,
    itemType: listing?.category
      ? String(listing.category)
      : row.entity_type
        ? String(row.entity_type)
        : undefined,
    grade: condition?.grade ? String(condition.grade) : undefined,
    heroImageUrl,
    galleryImageUrls,
    marketplaceSlug: isPublished && slug ? slug : undefined,
    marketplaceUrl: isPublished && slug ? `/marketplace/${slug}` : undefined,
  });

  return result;
}
