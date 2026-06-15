-- Marketplace acquisition interests: links a lead/email to marketplace items they inquired about.

create table if not exists public.marketplace_acquire_interests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  email text not null,
  marketplace_item_id uuid not null references public.marketplace_items(id) on delete cascade,
  listing_slug text not null,
  listing_title text not null,
  created_at timestamptz not null default now(),
  unique (email, marketplace_item_id)
);

create index if not exists marketplace_acquire_interests_email_idx
  on public.marketplace_acquire_interests (email);

create index if not exists marketplace_acquire_interests_lead_id_idx
  on public.marketplace_acquire_interests (lead_id);

comment on table public.marketplace_acquire_interests is
  'Tracks which marketplace listings a visitor expressed acquisition interest in (by email/lead).';

alter table public.marketplace_acquire_interests enable row level security;

-- No policies: only service role (API routes) can read/write; blocks direct anon/authenticated access.
