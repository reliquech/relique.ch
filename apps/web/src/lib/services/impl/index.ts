/**
 * Service implementations (adapters) for web app
 * These implement contracts from @relique/shared/domain using localStorage/fixtures
 */

export { verifyServiceSupabase as verifyService } from "./verify.supabase";
export { marketplaceServiceLocal as marketplaceService } from "./marketplace.local";
export { consignServiceSupabase as consignService } from "./consign.supabase";
export { contentServiceLocal as contentService } from "./content.local";

