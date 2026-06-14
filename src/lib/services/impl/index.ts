/**
 * Service implementations (adapters) for web app.
 * Production public flows use Supabase/API adapters — not localStorage.
 */

export { verifyServiceSupabase as verifyService } from "./verify.supabase";
export { marketplaceServiceLocal as marketplaceService } from "./marketplace.local";
export { consignServiceSupabase as consignService } from "./consign.supabase";
export { contentServiceLocal as contentService } from "./content.local";

