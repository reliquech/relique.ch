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
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
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

function parseRowJson(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? (value as Record<string, any>) : {};
}

function mergeFeatured(
  existing?: { is: boolean; order: number | null } | null,
  updates?: Partial<{ is: boolean; order: number | null }>
) {
  const base = existing ?? { is: false, order: null };
  if (!updates) return base;
  return {
    is: updates.is !== undefined ? updates.is : base.is,
    order: updates.order !== undefined ? updates.order : base.order,
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
      seo_title: legacy.seo_title ?? null,
      seo_description: legacy.seo_description ?? null,
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
  const existingState = parseRowJson(existing.state);
  const existingListing = parseRowJson(existing.listing);
  const existingJersey = parseRowJson(existing.jersey);
  const existingSigning = parseRowJson(existing.signing);
  const existingCondition = parseRowJson(existing.condition);
  const existingAuth = parseRowJson(existing.auth);
  const existingRefs = parseRowJson(existing.refs) ?? DEFAULT_REFS;
  const existingMedia = parseRowJson(existing.media) ?? DEFAULT_MEDIA;
  const row: Record<string, any> = {
    ...existing,
    state: existingState,
    listing: existingListing,
    jersey: existingJersey,
    signing: existingSigning,
    condition: existingCondition,
    auth: existingAuth,
    refs: existingRefs,
    media: existingMedia,
  };

  const parsed = MarketplaceUpdateSchema.strict().safeParse(body);
  if (parsed.success) {
    const updates = parsed.data;
    const now = new Date().toISOString();

    const state = updates.state
      ? {
          ...row.state,
          ...updates.state,
          featured: mergeFeatured(row.state.featured, updates.state.featured),
          updated_at: now,
          created_by: row.state.created_by ?? userId,
        }
      : { ...row.state, updated_at: now, created_by: row.state.created_by ?? userId };

    const listing = updates.listing
      ? {
          ...row.listing,
          ...updates.listing,
          price: { ...row.listing.price, ...updates.listing.price },
        }
      : row.listing;

    const jersey = updates.jersey
      ? {
          ...row.jersey,
          ...updates.jersey,
          brand: { ...row.jersey.brand, ...updates.jersey?.brand },
          size: { ...row.jersey.size, ...updates.jersey?.size },
        }
      : row.jersey;

    const signing = updates.signing
      ? {
          ...row.signing,
          ...updates.signing,
          ink: { ...row.signing.ink, ...updates.signing?.ink },
          placement: { ...row.signing.placement, ...updates.signing?.placement },
        }
      : row.signing;

    const condition = updates.condition ? { ...row.condition, ...updates.condition } : row.condition;
    const auth = updates.auth ? { ...row.auth, ...updates.auth } : row.auth;
    const refs = updates.refs ? { ...existingRefs, ...updates.refs } : existingRefs;
    const media = updates.media ? { ...existingMedia, ...updates.media } : existingMedia;

    return MarketplaceListingSchema.parse({
      ...row,
      ...updates,
      state,
      listing,
      jersey,
      signing,
      condition,
      auth,
      refs,
      media,
      entity_type: updates.entity_type ?? (row as any).entity_type ?? DEFAULT_ENTITY_TYPE,
    });
  }

  const legacy = LegacyMarketplaceItemSchema.parse(body);
  const now = new Date().toISOString();
  const title = legacy.title ?? row.listing?.title ?? "Untitled";
  const slug = legacy.slug ?? (row as any).slug ?? slugify(title);
  const signers = legacy.signed_by ? parseCommaList(legacy.signed_by) : row.signing?.signers ?? [];
  const listingCategory = legacy.category ? mapLegacyCategory(legacy.category) : row.listing?.category ?? "collector";

  return MarketplaceListingSchema.parse({
    ...row,
    refs: existingRefs,
    slug,
    state: {
      ...row.state,
      lifecycle: legacy.status ? mapLegacyStatus(legacy.status) : row.state.lifecycle,
      featured: mergeFeatured(row.state.featured, {
        is: legacy.is_featured,
        order: legacy.featured_order ?? undefined,
      }),
      updated_at: now,
      created_by: row.state.created_by ?? userId,
    },
    listing: {
      ...row.listing,
      title,
      subtitle: legacy.full_description ?? row.listing.subtitle ?? null,
      short: legacy.description ?? row.listing.short ?? "",
      price: {
        ...row.listing.price,
        amount: legacy.price_usd ?? row.listing.price.amount ?? 0,
        currency: legacy.currency ?? row.listing.price.currency ?? "USD",
      },
      category: listingCategory,
      seo_title: legacy.seo_title ?? row.listing.seo_title ?? null,
      seo_description: legacy.seo_description ?? row.listing.seo_description ?? null,
    },
    signing: {
      ...row.signing,
      signers,
      count: signers.length,
    },
    condition: {
      ...row.condition,
      notes: legacy.condition ?? row.condition.notes ?? null,
    },
    auth: {
      ...row.auth,
      status: legacy.authenticated ? "verified" : row.auth.status,
      provider_id: legacy.coa_issuer ?? row.auth.provider_id ?? null,
      coa_refs: legacy.certificate ? [legacy.certificate] : row.auth.coa_refs ?? [],
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
