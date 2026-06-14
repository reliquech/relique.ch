-- Add product_id for RLQ-XXXX-XXXX verify lookups (Phase 2)
alter table public.marketplace_items
  add column if not exists product_id text;

comment on column public.marketplace_items.product_id is
  'Public verify product ID (RLQ-XXXX-XXXX). COA refs remain in auth.coa_refs JSONB.';

create unique index if not exists marketplace_items_product_id_idx
  on public.marketplace_items (product_id)
  where product_id is not null;

create index if not exists marketplace_items_auth_coa_refs_idx
  on public.marketplace_items using gin ((auth -> 'coa_refs'));
