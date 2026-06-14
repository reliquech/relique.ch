-- Phase 7: composite indexes for public marketplace browse and CRM hot paths

create index if not exists marketplace_items_public_browse_idx
  on public.marketplace_items (state_lifecycle, state_visibility, listing_category, price_amount desc)
  where state_lifecycle = 'published' and state_visibility = 'public';

create index if not exists leads_source_status_idx
  on public.leads (source, status, created_at desc);

create index if not exists consigned_items_queue_idx
  on public.consigned_items (status, created_at desc)
  where status in ('submitted', 'in_review');
