import { NextRequest, NextResponse } from "next/server";
import { createClient, createAnonClient, createServiceRoleClient } from "@/lib/supabase/server";
import { formatSupabaseError } from "@/lib/supabase/formatSupabaseError";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";
import { mapRowToListing } from "./utils";
import {
  normalizeMarketplaceCreate,
  buildMarketplaceInsertPayload,
} from "./marketplaceUtils";

const MarketplaceListQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  is_featured: z.string().optional(),
  featured: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  price_min: z.string().optional(),
  price_max: z.string().optional(),
  athlete: z.string().optional(),
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeAdminSort(sort?: string, order?: string) {
  if (sort === "price-desc" || (sort === "price_usd" && order !== "asc")) {
    return { column: "price_amount", ascending: false };
  }
  if (sort === "price-asc" || (sort === "price_usd" && order === "asc")) {
    return { column: "price_amount", ascending: true };
  }
  if (sort === "newest" || sort === "created_at") {
    return { column: "created_at", ascending: false };
  }
  if (sort === "title") {
    return { column: "listing_title", ascending: order === "desc" ? false : true };
  }
  const column = SORT_COLUMNS[sort ?? "updated_at"] ?? "updated_at";
  return { column, ascending: order === "asc" };
}

const SORT_COLUMNS: Record<string, string> = {
  updated_at: "updated_at",
  title: "listing_title",
  price_usd: "price_amount",
  created_at: "created_at",
};

type ParsedListQuery = z.infer<typeof MarketplaceListQuerySchema>;

function escapeIlike(value: string) {
  return value.replace(/[%_,]/g, "");
}

async function fetchStatusCounts(supabase: ReturnType<typeof createServiceRoleClient>) {
  const [allRes, draftRes, publishedRes, archivedRes] = await Promise.all([
    supabase.from("marketplace_items").select("*", { count: "exact", head: true }),
    supabase
      .from("marketplace_items")
      .select("*", { count: "exact", head: true })
      .eq("state_lifecycle", "draft"),
    supabase
      .from("marketplace_items")
      .select("*", { count: "exact", head: true })
      .eq("state_lifecycle", "published"),
    supabase
      .from("marketplace_items")
      .select("*", { count: "exact", head: true })
      .eq("state_lifecycle", "archived"),
  ]);

  return {
    all: allRes.count ?? 0,
    draft: draftRes.count ?? 0,
    published: publishedRes.count ?? 0,
    archived: archivedRes.count ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAdminListFilters(query: any, parsed: ParsedListQuery) {
  let next = query;

  if (parsed.status) {
    const statuses = parsed.status.split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      next = next.eq("state_lifecycle", statuses[0]);
    } else if (statuses.length > 1) {
      next = next.in("state_lifecycle", statuses);
    }
  }

  if (parsed.category) {
    next = next.eq("listing_category", parsed.category);
  }

  const featuredParam = parsed.featured ?? parsed.is_featured;
  if (featuredParam !== undefined && featuredParam !== "") {
    next = next.eq("featured_is", featuredParam === "true");
  }

  if (parsed.price_min) {
    const min = parseFloat(parsed.price_min);
    if (!Number.isNaN(min)) next = next.gte("price_amount", min);
  }

  if (parsed.price_max) {
    const max = parseFloat(parsed.price_max);
    if (!Number.isNaN(max)) next = next.lte("price_amount", max);
  }

  if (parsed.athlete) {
    const athlete = escapeIlike(parsed.athlete.trim());
    if (athlete) {
      next = next.ilike("signing->signers->>0", `%${athlete}%`);
    }
  }

  if (parsed.q) {
    const q = escapeIlike(parsed.q.trim());
    if (q) {
      const orFilters = [
        `listing_title.ilike.%${q}%`,
        `slug.ilike.%${q}%`,
        `signing->signers->>0.ilike.%${q}%`,
      ];
      if (UUID_REGEX.test(q)) {
        orFilters.push(`id.eq.${q}`);
      }
      next = next.or(orFilters.join(","));
    }
  }

  return next;
}

async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

async function adminGet(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const supabase = createServiceRoleClient();
  const searchParams = request.nextUrl.searchParams;

  const parsed = MarketplaceListQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    is_featured: searchParams.get("is_featured") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
    price_min: searchParams.get("price_min") ?? undefined,
    price_max: searchParams.get("price_max") ?? undefined,
    athlete: searchParams.get("athlete") ?? undefined,
  });

  const page = parsed.page ? parseInt(parsed.page, 10) : 1;
  const pageSize = parsed.pageSize ? parseInt(parsed.pageSize, 10) : 25;
  const offset = (page - 1) * pageSize;

  const { column: sortColumn, ascending } = normalizeAdminSort(parsed.sort, parsed.order);

  let query = supabase.from("marketplace_items").select("*", { count: "exact" });
  query = applyAdminListFilters(query, parsed);
  query = query.order(sortColumn, { ascending }).range(offset, offset + pageSize - 1);

  const [{ data, error, count }, counts] = await Promise.all([
    query,
    fetchStatusCounts(supabase),
  ]);

  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
    counts,
  });
}

async function publicGet(request: NextRequest) {
  const supabase = createAnonClient();
  const searchParams = request.nextUrl.searchParams;

  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "price-desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "100", 10);
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("marketplace_items")
    .select("*", { count: "exact" })
    .eq("state_lifecycle", "published")
    .eq("state_visibility", "public")
    .range(offset, offset + pageSize - 1);

  if (category && category !== "ALL") {
    query = query.eq("listing_category", category);
  }

  const q = searchParams.get("q");
  if (q) {
    const escapedQ = escapeIlike(q.trim());
    if (escapedQ) {
      const orFilters = [
        `listing_title.ilike.%${escapedQ}%`,
        `slug.ilike.%${escapedQ}%`,
        `signing->signers->>0.ilike.%${escapedQ}%`,
      ];
      query = query.or(orFilters.join(","));
    }
  }

  const priceMin = searchParams.get("price_min");
  if (priceMin) {
    const min = parseFloat(priceMin);
    if (!Number.isNaN(min)) query = query.gte("price_amount", min);
  }

  const priceMax = searchParams.get("price_max");
  if (priceMax) {
    const max = parseFloat(priceMax);
    if (!Number.isNaN(max)) query = query.lte("price_amount", max);
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price_amount", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_amount", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("price_amount", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
  }

  const items = (data || []).map(mapRowToListing);

  return NextResponse.json({
    items,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  });
}

// GET /api/marketplace — public published list OR authenticated admin list
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const isPublicScope = request.nextUrl.searchParams.get("scope") === "public";
    if (sessionUser && !isPublicScope) {
      return adminGet(request);
    }
    return publicGet(request);
  } catch (error) {
    console.error("Error fetching marketplace items:", error);

    const errorMessage = sanitizeErrorMessage(
      error instanceof Error ? error.message : "Internal server error"
    );

    if (errorMessage.includes("Missing Supabase configuration")) {
      return NextResponse.json(
        {
          error: errorMessage,
          details:
            "Please check your .env.local file and ensure all required Supabase environment variables are set.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/marketplace — create item (authenticated)
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();

    const listing = normalizeMarketplaceCreate(body, user.id);

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(buildMarketplaceInsertPayload(listing) as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("audit_logs")
      .insert({
        action: "CREATE",
        entity_type: "marketplace_item",
        entity_id: (data as { id: string }).id,
        metadata: { item: data },
      } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
