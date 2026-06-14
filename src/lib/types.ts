export interface MarketplaceListing {
  entity_type: string;
  id: string;
  slug: string;
  sku: string;
  state: {
    lifecycle: "draft" | "published" | "archived";
    visibility: "private" | "unlisted" | "public";
    featured: { is: boolean; order: number | null };
    publish_at: string | null;
    created_at: string;
    updated_at: string;
    created_by: string;
  };
  listing: {
    title: string;
    subtitle?: string | null;
    short: string;
    price: { amount: number; currency: string; compare_at?: number | null };
    category: "premium" | "sport" | "collector" | "story";
    tags: string[];
  };
  jersey: {
    sport: "football" | "soccer";
    club_id: string;
    season?: string | null;
    kit: "home" | "away" | "third" | "goalkeeper" | "training" | "special";
    edition: "replica" | "authentic" | "player_issue" | "match_prepared" | "match_worn";
    brand: { id: string; custom?: string | null };
    size: { id: string; region: string; custom?: string | null };
    style_code?: string | null;
  };
  signing: {
    type: "single" | "multi";
    signers: string[];
    count: number;
    ink: { id: string; custom?: string | null };
    placement: { id: string; custom?: string | null };
    inscription_text?: string | null;
    sig_condition: "A" | "B" | "C" | "D" | "unknown";
  };
  condition: {
    grade: "A" | "B" | "C" | "D" | "F" | "unknown";
    wear:
      | "new_with_tags"
      | "new_no_tags"
      | "lightly_used"
      | "used"
      | "heavily_used"
      | "match_worn";
    notes?: string | null;
  };
  auth: {
    status: "none" | "pending" | "verified" | "rejected";
    provider_id?: string | null;
    coa_refs: string[];
  };
  refs: {
    content_id?: string | null;
    media_album_id?: string | null;
    proof_bundle_id?: string | null;
  };
  media: {
    hero_id?: string | null;
    gallery?: string[] | null;
  };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured: boolean;
  image: string;
  tags: string[];
  author?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time?: string;
  location: string;
  type?: "appearance" | "auction" | "exhibition" | "other";
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsignSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  itemDescription: string;
  category?: string;
  estimatedValue?: number;
  coaIssuer?: string;
  howDidYouHear?: string;
  files?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  sport?: string;
  signedBy?: string;
  status?: string;
  coaIssuer?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
