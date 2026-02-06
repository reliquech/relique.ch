-- Additional indexes for performance optimization
-- Most indexes are created in table migrations, this file is for additional ones

-- Full-text search index on marketplace items (if needed in future)
-- create index marketplace_items_title_description_idx on public.marketplace_items using gin(to_tsvector('english', listing_title || ' ' || coalesce(listing->>'short', '')));

-- Composite indexes for common queries
create index marketplace_items_lifecycle_featured_idx on public.marketplace_items(state_lifecycle, featured_is) where featured_is = true;
create index consigned_items_status_created_idx on public.consigned_items(status, created_at desc);
