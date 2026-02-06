-- Add metadata column for structured marketplace listing info
alter table public.marketplace_items
  add column if not exists metadata jsonb;

comment on column public.marketplace_items.metadata is 'Structured listing metadata for specialized item types (e.g., signed jerseys).';
