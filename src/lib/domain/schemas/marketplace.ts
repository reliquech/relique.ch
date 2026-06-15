import { z } from "zod";

const FeaturedSchema = z.object({
  is: z.boolean(),
  order: z.number().int().optional().nullable(),
});

export const ItemStatusSchema = z.enum(["draft", "published", "archived"]);
export type ItemStatus = z.infer<typeof ItemStatusSchema>;

export const VisibilitySchema = z.enum(["private", "unlisted", "public"]);

export const StateSchema = z.object({
  lifecycle: ItemStatusSchema,
  visibility: VisibilitySchema,
  featured: FeaturedSchema,
  publish_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string(),
});

export const ListingPriceSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(3).max(3),
  compare_at: z.number().min(0).optional().nullable(),
});

export const ListingSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  short: z.string(),
  price: ListingPriceSchema,
  category: z.enum(["premium", "sport", "collector", "story"]),
  tags: z.array(z.string()).default([]),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

const OptionSchema = z.object({
  id: z.string(),
  custom: z.string().optional().nullable(),
});

const SizeSchema = z.object({
  id: z.string(),
  region: z.string(),
  custom: z.string().optional().nullable(),
});

export const JerseySchema = z.object({
  sport: z.enum(["football", "soccer"]),
  club_id: z.string(),
  season: z.string().optional().nullable(),
  kit: z.enum(["home", "away", "third", "goalkeeper", "training", "special"]),
  edition: z.enum(["replica", "authentic", "player_issue", "match_prepared", "match_worn"]),
  brand: OptionSchema,
  size: SizeSchema,
  style_code: z.string().optional().nullable(),
});

export const SigningSchema = z.object({
  type: z.enum(["single", "multi"]),
  signers: z.array(z.string()),
  count: z.number().int().min(0),
  ink: OptionSchema,
  placement: OptionSchema,
  inscription_text: z.string().optional().nullable(),
  sig_condition: z.enum(["A", "B", "C", "D", "unknown"]),
});

export const ConditionSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "F", "unknown"]),
  wear: z.enum([
    "new_with_tags",
    "new_no_tags",
    "lightly_used",
    "used",
    "heavily_used",
    "match_worn",
  ]),
  notes: z.string().optional().nullable(),
});

export const AuthSchema = z.object({
  status: z.enum(["none", "pending", "verified", "rejected"]),
  provider_id: z.string().optional().nullable(),
  coa_refs: z.array(z.string()),
});

export const RefsSchema = z.object({
  content_id: z.string().optional().nullable(),
  media_album_id: z.string().optional().nullable(),
  proof_bundle_id: z.string().optional().nullable(),
});

export const MediaSchema = z.object({
  hero_id: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().nullable(),
});

export const MarketplaceListingSchema = z.object({
  entity_type: z.string(),
  id: z.string(),
  slug: z.string(),
  sku: z.string(),
  state: StateSchema,
  listing: ListingSchema,
  jersey: JerseySchema,
  signing: SigningSchema,
  condition: ConditionSchema,
  auth: AuthSchema,
  refs: RefsSchema,
  media: MediaSchema,
});

export const MarketplaceFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sport: z.string().optional(),
  signedBy: z.string().optional(),
  status: z.string().optional(),
  coaIssuer: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
});

export const PaginationParamsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
});

export const SortOptionSchema = z.enum([
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "featured",
]);
export type SortOption = z.infer<typeof SortOptionSchema>;

export type MarketplaceListing = z.infer<typeof MarketplaceListingSchema>;
export type MarketplaceFilters = z.infer<typeof MarketplaceFiltersSchema>;
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
