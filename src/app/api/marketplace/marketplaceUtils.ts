import { z } from "zod";
import {
  MarketplaceListingSchema,
  StateSchema,
  ListingSchema,
  JerseySchema,
  SigningSchema,
  ConditionSchema,
  AuthSchema,
  RefsSchema,
  MediaSchema,
} from "@/lib/domain";

const DEFAULT_ENTITY_TYPE = "signed_football_jersey";

const LegacyMarketplaceItemSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  full_description: z.string().optional().nullable(),
  price_usd: z.number().optional(),
  currency: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional().nullable(),
  category: z.string().optional(),
  status: z.string().optional(),
  authenticated: z.boolean().optional(),
  certificate: z.string().optional().nullable(),
  authenticated_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  signed_by: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_rating: z.number().optional().nullable(),
  seller_verified: z.boolean().optional().nullable(),
  is_featured: z.boolean().optional(),
  featured_order: z.number().optional().nullable(),
  commission_rate: z.number().optional().nullable(),
  created_by: z.string().optional().nullable(),
});

const MarketplaceCreateSchema = MarketplaceListingSchema.extend({
  id: z.string().optional(),
  state: StateSchema.extend({
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    created_by: z.string().optional(),
  }),
});

const MarketplaceUpdateSchema = z.object({
  entity_type: z.string().optional(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  state: StateSchema.partial().optional(),
  listing: ListingSchema.partial().optional(),
  jersey: JerseySchema.partial().optional(),
  signing: SigningSchema.partial().optional(),
  condition: ConditionSchema.partial().optional(),
  auth: AuthSchema.partial().optional(),
  refs: RefsSchema.partial().optional(),
  media: MediaSchema.partial().optional(),
});

const DEFAULT_JERSEY = {
  sport: "football" as const,
  club_id: "00000000-0000-0000-0000-000000000000",
  season: null,
  kit: "home" as const,
  edition: "replica" as const,
  brand: { id: "nike", custom: null },
  size: { id: "L", region: "EU", custom: null },
  style_code: null,
};

const DEFAULT_SIGNING = {
  type: "single" as const,
  signers: [] as string[],
  count: 0,
  ink: { id: "black_sharpie", custom: null },
  placement: { id: "front_chest", custom: null },
  inscription_text: null,
  sig_condition: "unknown" as const,
};

const DEFAULT_CONDITION = {
  grade: "unknown" as const,
  wear: "used" as const,
  notes: null,
};

const DEFAULT_REFS = {
  content_id: null,
  media_album_id: null,
  proof_bundle_id: null,
};

const DEFAULT_MEDIA = {
  hero_id: null,
  gallery: [] as string[],
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseCommaList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function mapLegacyStatus(status?: string | null): "draft" | "published" | "archived" {
  if (!status) return "draft";
  const normalized = status.toLowerCase();
  if (normalized === "published") return "published";
  if (normalized === "archived") return "archived";
  return "draft";
}

function mapLegacyCategory(category?: string | null): "premium" | "sport" | "collector" | "story" {
  if (!category) return "collector";
  const normalized = category.toLowerCase();
  if (normalized.includes("sport")) return "sport";
  if (normalized.includes("story")) return "story";
  if (normalized.includes("premium")) return "premium";
  return "collector";
}

function mergeFeatured(
  existing: { is: boolean; order: number | null },
  updates?: Partial<{ is: boolean; order: number | null }>
) {
  if (!updates) return existing;
  return {
    is: updates.is ?? existing.is,
    order: updates.order ?? existing.order,
  };
}

export function normalizeMarketplaceCreate(body: unknown, userId: string) {
  if (body && typeof body === "object" && "state" in (body as any) && "listing" in (body as any)) {
    const parsed = MarketplaceCreateSchema.parse(body);
    const now = new Date().toISOString();
    const state = {
      ...parsed.state,
      created_at: parsed.state.created_at ?? now,
      updated_at: now,
      created_by: parsed.state.created_by ?? userId,
    };

    return MarketplaceListingSchema.parse({
      ...parsed,
      entity_type: parsed.entity_type || DEFAULT_ENTITY_TYPE,
      state,
    });
  }

  const legacy = LegacyMarketplaceItemSchema.parse(body);
  const now = new Date().toISOString();
  const title = legacy.title ?? "Untitled";
  const slug = legacy.slug ?? slugify(title);
  const signers = parseCommaList(legacy.signed_by ?? undefined);
  const listingCategory = mapLegacyCategory(legacy.category ?? undefined);

  return MarketplaceListingSchema.parse({
    entity_type: DEFAULT_ENTITY_TYPE,
    id: "legacy",
    slug,
    sku: `SKU-${Date.now()}`,
    state: {
      lifecycle: mapLegacyStatus(legacy.status ?? undefined),
      visibility: "public",
      featured: {
        is: legacy.is_featured ?? false,
        order: legacy.featured_order ?? null,
      },
      publish_at: null,
      created_at: now,
      updated_at: now,
      created_by: legacy.created_by ?? userId,
    },
    listing: {
      title,
      subtitle: legacy.full_description ?? null,
      short: legacy.description ?? "",
      price: {
        amount: legacy.price_usd ?? 0,
        currency: legacy.currency ?? "USD",
        compare_at: null,
      },
      category: listingCategory,
      tags: slug ? [slug] : [],
    },
    jersey: DEFAULT_JERSEY,
    signing: {
      ...DEFAULT_SIGNING,
      signers,
      count: signers.length,
    },
    condition: {
      ...DEFAULT_CONDITION,
      notes: legacy.condition ?? null,
    },
    auth: {
      status: legacy.authenticated ? "verified" : "none",
      provider_id: legacy.coa_issuer ?? null,
      coa_refs: legacy.certificate ? [legacy.certificate] : [],
    },
    refs: DEFAULT_REFS,
    media: {
      hero_id: legacy.image ?? null,
      gallery: legacy.images ?? [],
    },
  });
}

export function normalizeMarketplaceUpdate(
  body: unknown,
  existing: Record<string, any>,
  userId: string
) {
  const existingRefs = existing.refs ?? DEFAULT_REFS;
  const existingMedia = existing.media ?? DEFAULT_MEDIA;

  const parsed = MarketplaceUpdateSchema.safeParse(body);
  if (parsed.success) {
    const updates = parsed.data;
    const now = new Date().toISOString();

    const state = updates.state
      ? {
          ...existing.state,
          ...updates.state,
          featured: mergeFeatured(existing.state.featured, updates.state.featured),
          updated_at: now,
          created_by: existing.state.created_by ?? userId,
        }
      : { ...existing.state, updated_at: now, created_by: existing.state.created_by ?? userId };

    const listing = updates.listing
      ? {
          ...existing.listing,
          ...updates.listing,
          price: { ...existing.listing.price, ...updates.listing.price },
        }
      : existing.listing;

    const jersey = updates.jersey
      ? {
          ...existing.jersey,
          ...updates.jersey,
          brand: { ...existing.jersey.brand, ...updates.jersey?.brand },
          size: { ...existing.jersey.size, ...updates.jersey?.size },
        }
      : existing.jersey;

    const signing = updates.signing
      ? {
          ...existing.signing,
          ...updates.signing,
          ink: { ...existing.signing.ink, ...updates.signing?.ink },
          placement: { ...existing.signing.placement, ...updates.signing?.placement },
        }
      : existing.signing;

    const condition = updates.condition ? { ...existing.condition, ...updates.condition } : existing.condition;
    const auth = updates.auth ? { ...existing.auth, ...updates.auth } : existing.auth;
    const refs = updates.refs ? { ...existingRefs, ...updates.refs } : existingRefs;
    const media = updates.media ? { ...existingMedia, ...updates.media } : existingMedia;

    return MarketplaceListingSchema.parse({
      ...existing,
      ...updates,
      state,
      listing,
      jersey,
      signing,
      condition,
      auth,
      refs,
      media,
      entity_type: updates.entity_type ?? existing.entity_type ?? DEFAULT_ENTITY_TYPE,
    });
  }

  const legacy = LegacyMarketplaceItemSchema.parse(body);
  const now = new Date().toISOString();
  const title = legacy.title ?? existing.listing?.title ?? "Untitled";
  const slug = legacy.slug ?? existing.slug ?? slugify(title);
  const signers = legacy.signed_by ? parseCommaList(legacy.signed_by) : existing.signing?.signers ?? [];
  const listingCategory = legacy.category ? mapLegacyCategory(legacy.category) : existing.listing?.category ?? "collector";

  return MarketplaceListingSchema.parse({
    ...existing,
    refs: existingRefs,
    slug,
    state: {
      ...existing.state,
      lifecycle: legacy.status ? mapLegacyStatus(legacy.status) : existing.state.lifecycle,
      featured: mergeFeatured(existing.state.featured, {
        is: legacy.is_featured,
        order: legacy.featured_order ?? undefined,
      }),
      updated_at: now,
      created_by: existing.state.created_by ?? userId,
    },
    listing: {
      ...existing.listing,
      title,
      subtitle: legacy.full_description ?? existing.listing.subtitle ?? null,
      short: legacy.description ?? existing.listing.short ?? "",
      price: {
        ...existing.listing.price,
        amount: legacy.price_usd ?? existing.listing.price.amount ?? 0,
        currency: legacy.currency ?? existing.listing.price.currency ?? "USD",
      },
      category: listingCategory,
    },
    signing: {
      ...existing.signing,
      signers,
      count: signers.length,
    },
    condition: {
      ...existing.condition,
      notes: legacy.condition ?? existing.condition.notes ?? null,
    },
    auth: {
      ...existing.auth,
      status: legacy.authenticated ? "verified" : existing.auth.status,
      provider_id: legacy.coa_issuer ?? existing.auth.provider_id ?? null,
      coa_refs: legacy.certificate ? [legacy.certificate] : existing.auth.coa_refs ?? [],
    },
    media: {
      ...existingMedia,
      hero_id: legacy.image ?? existingMedia?.hero_id ?? null,
      gallery: legacy.images ?? existingMedia?.gallery ?? [],
    },
  });
}

export function parseMarketplaceId(id: string): string {
  return id;
}

export function buildMarketplaceInsertPayload(item: Record<string, any>) {
  return {
    entity_type: item.entity_type,
    slug: item.slug,
    sku: item.sku,
    state: item.state,
    listing: item.listing,
    jersey: item.jersey,
    signing: item.signing,
    condition: item.condition,
    auth: item.auth,
    refs: item.refs,
    media: item.media,
  };
}
