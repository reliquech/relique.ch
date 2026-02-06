-- =============================================================================
-- Marketplace Items (Signed Jersey schema)
-- Base schema aligned to marketplace listing payloads.
-- =============================================================================

create table public.marketplace_items (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  slug text not null unique,
  sku text not null,

  state jsonb not null,
  listing jsonb not null,
  jersey jsonb not null,
  signing jsonb not null,
  condition jsonb not null,
  auth jsonb not null,
  refs jsonb,
  media jsonb,

  -- Generated columns for filtering/sorting
  state_lifecycle text generated always as (state->>'lifecycle') stored,
  state_visibility text generated always as (state->>'visibility') stored,
  featured_is boolean generated always as ((state->'featured'->>'is')::boolean) stored,
  featured_order integer generated always as ((state->'featured'->>'order')::int) stored,
  publish_at timestamp with time zone generated always as ((state->>'publish_at')::timestamptz) stored,
  created_at timestamp with time zone generated always as ((state->>'created_at')::timestamptz) stored,
  updated_at timestamp with time zone generated always as ((state->>'updated_at')::timestamptz) stored,
  created_by uuid generated always as ((state->>'created_by')::uuid) stored,
  listing_title text generated always as (listing->>'title') stored,
  listing_category text generated always as (listing->>'category') stored,
  price_amount numeric(12,2) generated always as ((listing->'price'->>'amount')::numeric) stored,
  price_currency text generated always as (listing->'price'->>'currency') stored
);

comment on table public.marketplace_items is 'Marketplace items stored as structured JSON payloads (state, listing, jersey, signing, condition, auth).';
comment on column public.marketplace_items.slug is 'URL-friendly identifier, unique, dùng cho route /marketplace/[slug]';
comment on column public.marketplace_items.state is 'State envelope (lifecycle, visibility, featured, timestamps, created_by)';
comment on column public.marketplace_items.listing is 'Listing content (title, short, price, category, tags)';
comment on column public.marketplace_items.jersey is 'Jersey metadata (sport, club, kit, edition, brand, size)';
comment on column public.marketplace_items.signing is 'Signing metadata (signers, ink, placement, condition)';
comment on column public.marketplace_items.condition is 'Physical condition metadata';
comment on column public.marketplace_items.auth is 'Authentication/COA status and references';
comment on column public.marketplace_items.media is 'Media references (hero, gallery)';
comment on column public.marketplace_items.state_lifecycle is 'Generated lifecycle for filtering';
comment on column public.marketplace_items.listing_category is 'Generated category for filtering';
comment on column public.marketplace_items.price_amount is 'Generated price amount for sorting';

-- Keep timestamps in state.updated_at aligned on updates
create or replace function public.set_marketplace_state_timestamps()
returns trigger as $$
declare
  now_ts timestamp with time zone := now();
begin
  if new.state is null then
    new.state := '{}'::jsonb;
  end if;

  if tg_op = 'INSERT' then
    if new.state->>'created_at' is null then
      new.state := jsonb_set(new.state, '{created_at}', to_jsonb(now_ts), true);
    end if;
  end if;

  new.state := jsonb_set(new.state, '{updated_at}', to_jsonb(now_ts), true);

  return new;
end;
$$ language plpgsql;

create trigger set_marketplace_state_timestamps
  before insert or update on public.marketplace_items
  for each row
  execute function public.set_marketplace_state_timestamps();

-- Enable RLS
alter table public.marketplace_items enable row level security;

-- Policy SELECT: published public items, or owner can view all
create policy "Select published or own drafts"
  on public.marketplace_items for select
  using (
    (state_lifecycle = 'published' and state_visibility in ('public', 'unlisted'))
    or ((select auth.uid()) = created_by)
  );

-- Indexes
create index marketplace_items_slug_idx on public.marketplace_items(slug);
create index marketplace_items_lifecycle_idx on public.marketplace_items(state_lifecycle);
create index marketplace_items_visibility_idx on public.marketplace_items(state_visibility);
create index marketplace_items_category_idx on public.marketplace_items(listing_category);
create index marketplace_items_featured_idx on public.marketplace_items(featured_is);
create index marketplace_items_featured_order_idx on public.marketplace_items(featured_order);
create index marketplace_items_created_at_idx on public.marketplace_items(created_at desc);
create index marketplace_items_created_by_idx on public.marketplace_items(created_by);
create index marketplace_items_price_amount_idx on public.marketplace_items(price_amount);
