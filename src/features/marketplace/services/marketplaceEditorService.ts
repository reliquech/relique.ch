import type { MarketplaceFormData } from "@/features/marketplace/schema";

export type MarketplaceEditorSaveMode = "draft" | "publish" | "update";
export type MarketplaceEditorSaveResult = { id: string; slug?: string; raw: unknown };

function slugify(title: string | undefined) {
  const normalized = (title ?? "").trim();
  if (!normalized) return "";
  return normalized
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function toPayload(data: MarketplaceFormData, status?: MarketplaceFormData["status"]) {
  const title = data.title?.trim() ?? "";
  const slug = slugify(title) || `draft-${Date.now()}`;
  return {
    slug,
    title,
    description: data.description,
    full_description: data.full_description ?? null,
    price_usd: data.price_usd,
    currency: "USD",
    image: data.image,
    images: data.images ?? null,
    category: data.category,
    status: status ?? data.status ?? "draft",
    authenticated: data.authenticated ?? false,
    certificate: data.certificate ?? null,
    authenticated_date: data.authenticated_date ?? null,
    coa_issuer: data.coa_issuer ?? null,
    signed_by: data.signed_by ?? null,
    condition: data.condition ?? null,
    provenance: data.provenance ?? null,
    seller_name: data.seller_name ?? null,
    seller_rating: data.seller_rating ?? null,
    seller_verified: data.seller_verified ?? null,
    is_featured: data.is_featured ?? false,
    featured_order: data.featured_order ?? null,
    commission_rate: data.commission_rate ?? null,
  };
}

async function parseSaveResponse(response: Response): Promise<MarketplaceEditorSaveResult> {
  const raw = (await response.json()) as { id?: unknown; slug?: unknown; details?: string; error?: string };
  if (!response.ok) {
    throw new Error(raw.details || raw.error || "Failed to save marketplace item");
  }

  return {
    id: typeof raw.id === "string" ? raw.id : "",
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
    raw,
  };
}

export async function createMarketplaceDraft(
  data: MarketplaceFormData,
  status: MarketplaceFormData["status"] = "draft"
): Promise<MarketplaceEditorSaveResult> {
  const response = await fetch("/api/marketplace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(data, status)),
  });
  return parseSaveResponse(response);
}

export async function updateMarketplaceItem(
  id: string,
  data: MarketplaceFormData,
  status?: MarketplaceFormData["status"]
): Promise<MarketplaceEditorSaveResult> {
  const response = await fetch(`/api/marketplace/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(data, status)),
  });
  return parseSaveResponse(response);
}
