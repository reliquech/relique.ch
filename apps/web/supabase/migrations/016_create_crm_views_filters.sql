-- =============================================================================
-- CRM Saved Views / Filters / Recent Searches
-- =============================================================================

create table public.crm_saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('customers','leads','deals','messages')),
  name text not null,
  state jsonb not null,
  created_at timestamp with time zone default now()
);

create table public.crm_saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('customers','leads','deals','messages')),
  name text not null,
  query text,
  filters jsonb,
  created_at timestamp with time zone default now()
);

create table public.crm_recent_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('customers','leads','deals','messages')),
  query text not null,
  created_at timestamp with time zone default now()
);

alter table public.crm_saved_views enable row level security;
alter table public.crm_saved_filters enable row level security;
alter table public.crm_recent_searches enable row level security;

create policy "Users can read own crm_saved_views"
  on public.crm_saved_views for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own crm_saved_views"
  on public.crm_saved_views for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own crm_saved_views"
  on public.crm_saved_views for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own crm_saved_views"
  on public.crm_saved_views for delete
  using ((select auth.uid()) = user_id);

create policy "Users can read own crm_saved_filters"
  on public.crm_saved_filters for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own crm_saved_filters"
  on public.crm_saved_filters for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own crm_saved_filters"
  on public.crm_saved_filters for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own crm_saved_filters"
  on public.crm_saved_filters for delete
  using ((select auth.uid()) = user_id);

create policy "Users can read own crm_recent_searches"
  on public.crm_recent_searches for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own crm_recent_searches"
  on public.crm_recent_searches for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own crm_recent_searches"
  on public.crm_recent_searches for delete
  using ((select auth.uid()) = user_id);

create index crm_saved_views_user_id_idx on public.crm_saved_views(user_id);
create index crm_saved_views_entity_idx on public.crm_saved_views(entity_type);

create index crm_saved_filters_user_id_idx on public.crm_saved_filters(user_id);
create index crm_saved_filters_entity_idx on public.crm_saved_filters(entity_type);

create index crm_recent_searches_user_id_idx on public.crm_recent_searches(user_id);
create index crm_recent_searches_entity_idx on public.crm_recent_searches(entity_type);
create index crm_recent_searches_created_at_idx on public.crm_recent_searches(created_at desc);
