-- Relique.co baseline schema (squashed 001-035, post-036 prune state)
-- FRESH INSTALLS ONLY — run this single file OR use legacy incremental chain
-- Generated: Phase 8 — do not apply on brownfield DBs with 001+ already applied
-- Excludes: email_logs, admin_upsert_profile (see 036_prune_dead_schema.sql for brownfield)


-- ========== 001_create_profiles.sql ==========
-- Create profiles table to extend auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- Create updated_at trigger function (reusable)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Create function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ========== 002_create_marketplace_items.sql ==========
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

-- ========== 003_create_consigned_items.sql ==========
-- Create consigned_items table
create table public.consigned_items (
  id uuid default gen_random_uuid() primary key,
  marketplace_item_id uuid references public.marketplace_items(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_address text,
  item_description text not null,
  category text,
  estimated_value numeric(12,2),
  appraisal_date timestamp with time zone,
  coa_issuer text,
  verification_status text,
  commission_rate numeric(5,2),
  listing_fee numeric(12,2),
  contract_date timestamp with time zone,
  status text not null check (status in ('draft', 'submitted', 'in_review', 'approved', 'rejected')) default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS
alter table public.consigned_items enable row level security;

-- Admin-only access (handled via service role in API routes)
-- RLS is enabled but service role bypasses it

-- Create indexes
create index consigned_items_marketplace_item_id_idx on public.consigned_items(marketplace_item_id);
create index consigned_items_status_idx on public.consigned_items(status);
create index consigned_items_contact_email_idx on public.consigned_items(contact_email);
create index consigned_items_created_at_idx on public.consigned_items(created_at desc);
create index consigned_items_created_by_idx on public.consigned_items(created_by);

-- Create trigger for updated_at
create trigger set_consigned_items_updated_at
  before update on public.consigned_items
  for each row
  execute function public.handle_updated_at();

-- ========== 004_create_audit_logs.sql ==========
-- Create audit_logs table (matching SETUP.md structure)
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references auth.users on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Admin-only read access (handled via service role in API routes)
-- RLS is enabled but service role bypasses it

-- Create indexes
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index audit_logs_action_idx on public.audit_logs(action);
create index audit_logs_entity_type_idx on public.audit_logs(entity_type);
create index audit_logs_entity_id_idx on public.audit_logs(entity_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

-- ========== 005_create_rls_policies.sql ==========
-- Additional RLS policies (most are created in table migrations)
-- This file contains any additional policies needed

-- Marketplace items SELECT: đã gộp vào policy "Select published or own drafts" trong 002_create_marketplace_items.sql

-- Consigned items: No public access (admin-only via service role)
-- This is intentionally left empty as all access is via service role

-- Audit logs: No public access (admin-only via service role)
-- This is intentionally left empty as all access is via service role

-- ========== 006_create_indexes.sql ==========
-- Additional indexes for performance optimization
-- Most indexes are created in table migrations, this file is for additional ones

-- Full-text search index on marketplace items (if needed in future)
-- create index marketplace_items_title_description_idx on public.marketplace_items using gin(to_tsvector('english', listing_title || ' ' || coalesce(listing->>'short', '')));

-- Composite indexes for common queries
create index marketplace_items_lifecycle_featured_idx on public.marketplace_items(state_lifecycle, featured_is) where featured_is = true;
create index consigned_items_status_created_idx on public.consigned_items(status, created_at desc);

-- ========== 007_create_triggers.sql ==========
-- Create function to log audit events
create or replace function public.log_audit_event()
returns trigger as $$
begin
  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    tg_op, -- INSERT, UPDATE, DELETE
    tg_table_name,
    coalesce(new.id::text, old.id::text),
    jsonb_build_object(
      'table', tg_table_name,
      'operation', tg_op,
      'old', to_jsonb(old),
      'new', to_jsonb(new)
    )
  );
  
  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer;

-- Note: Triggers are optional and can be heavy on high-traffic tables
-- Consider using application-level logging instead for better control
-- Uncomment to enable automatic audit logging:

-- create trigger marketplace_items_audit_trigger
--   after insert or update or delete on public.marketplace_items
--   for each row
--   execute function public.log_audit_event();

-- create trigger consigned_items_audit_trigger
--   after insert or update or delete on public.consigned_items
--   for each row
--   execute function public.log_audit_event();

-- ========== 008_storage_marketplace.sql ==========
-- =============================================================================
-- Storage: Bucket cho ảnh Marketplace Items
-- Dùng để lưu ảnh sản phẩm (media.hero_id, media.gallery) tham chiếu từ public.marketplace_items
-- Upload qua Admin app (service role) hoặc authenticated user có quyền
-- =============================================================================

-- Tạo bucket marketplace-images (public = true để frontend hiển thị ảnh không cần signed URL)
-- file_size_limit: 5242880 = 5MB; allowed_mime_types: chỉ ảnh
-- Nếu báo lỗi cột không tồn tại, dùng phiên bản rút gọn bên dưới (chỉ id, name, public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-images',
  'marketplace-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Phiên bản rút gọn (bỏ file_size_limit, allowed_mime_types) nếu schema không có cột:
-- insert into storage.buckets (id, name, public)
-- values ('marketplace-images', 'marketplace-images', true)
-- on conflict (id) do update set public = excluded.public;

-- RLS đã bật mặc định trên storage.objects. Tạo policy cho bucket marketplace-images:

-- 1) Mọi người (kể cả anonymous) được xem ảnh trong bucket (phục vụ trang public)
create policy "Public read marketplace images"
  on storage.objects for select
  using (bucket_id = 'marketplace-images');

-- 2) Chỉ authenticated user được upload (admin app dùng service role hoặc user đăng nhập)
create policy "Authenticated upload marketplace images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'marketplace-images');

-- 3) Authenticated user được cập nhật/xóa file trong bucket (admin quản lý ảnh)
create policy "Authenticated update marketplace images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'marketplace-images');

create policy "Authenticated delete marketplace images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'marketplace-images');

-- ========== 009_fix_rls_performance.sql ==========
-- Corrective migration: sửa RLS theo Supabase linter (auth_rls_initplan + multiple_permissive_policies)
-- Idempotent: dùng drop policy if exists để chạy được trên DB mới (đã có policy từ 001/002) và DB cũ (còn policy tên cũ)

-- profiles: dùng (select auth.uid()) thay vì auth.uid() để initplan, cache 1 lần/query
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- marketplace_items: gộp 2 policy SELECT thành 1 (tránh multiple permissive)
drop policy if exists "Select published or own drafts" on public.marketplace_items;
drop policy if exists "Public can view published items" on public.marketplace_items;
drop policy if exists "Users can view own draft items" on public.marketplace_items;

create policy "Select published or own drafts"
  on public.marketplace_items for select
  using (
    (state_lifecycle = 'published' and state_visibility in ('public', 'unlisted'))
    or ((select auth.uid()) = created_by)
  );

-- ========== 010_create_crm_core.sql ==========
-- =============================================================================
-- CRM Core Tables: customers, leads, deals, pipeline_stages, messages, attachments
-- =============================================================================

-- Customers
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text,
  company text,
  address text,
  tags text[],
  notes text,
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text,
  company text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'unqualified')) default 'new',
  score integer default 0,
  last_contacted_at timestamp with time zone,
  owner_id uuid references public.profiles(id) on delete set null,
  converted_customer_id uuid references public.customers(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Pipeline stages
create table public.pipeline_stages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  position integer not null default 1,
  color text,
  is_default boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Deals
create table public.deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  pipeline_stage_id uuid references public.pipeline_stages(id) on delete set null,
  value numeric(12,2),
  currency text not null default 'USD',
  probability integer default 0,
  expected_close_date date,
  status text not null check (status in ('open', 'won', 'lost')) default 'open',
  closed_at timestamp with time zone,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages (contact inquiries)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null check (status in ('new', 'open', 'pending', 'closed')) default 'new',
  source text,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Attachments (generic links to storage objects)
create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id text not null,
  file_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

-- Indexes
create index customers_email_idx on public.customers(email);
create index customers_status_idx on public.customers(status);
create index customers_created_at_idx on public.customers(created_at desc);

create index leads_email_idx on public.leads(email);
create index leads_status_idx on public.leads(status);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_created_at_idx on public.leads(created_at desc);

create index pipeline_stages_position_idx on public.pipeline_stages(position);

create index deals_status_idx on public.deals(status);
create index deals_stage_id_idx on public.deals(pipeline_stage_id);
create index deals_customer_id_idx on public.deals(customer_id);
create index deals_created_at_idx on public.deals(created_at desc);

create index messages_status_idx on public.messages(status);
create index messages_email_idx on public.messages(email);
create index messages_created_at_idx on public.messages(created_at desc);

create index attachments_entity_idx on public.attachments(entity_type, entity_id);

-- updated_at triggers
create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.handle_updated_at();

create trigger set_leads_updated_at
  before update on public.leads
  for each row
  execute function public.handle_updated_at();

create trigger set_pipeline_stages_updated_at
  before update on public.pipeline_stages
  for each row
  execute function public.handle_updated_at();

create trigger set_deals_updated_at
  before update on public.deals
  for each row
  execute function public.handle_updated_at();

create trigger set_messages_updated_at
  before update on public.messages
  for each row
  execute function public.handle_updated_at();

-- ========== 011_storage_crm.sql ==========
-- =============================================================================
-- Storage: Bucket for CRM attachments (documents, images)
-- =============================================================================

-- Create bucket (private by default)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'crm-attachments',
  'crm-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- If schema doesn't support file_size_limit / allowed_mime_types, use reduced version:
-- insert into storage.buckets (id, name, public)
-- values ('crm-attachments', 'crm-attachments', false)
-- on conflict (id) do update set public = excluded.public;

-- Policies (service role bypasses RLS, but keep for authenticated access)
create policy "Authenticated read crm attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'crm-attachments');

create policy "Authenticated upload crm attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'crm-attachments');

create policy "Authenticated update crm attachments"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'crm-attachments');

create policy "Authenticated delete crm attachments"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'crm-attachments');

-- ========== 012_seed_pipeline_stages.sql ==========
-- =============================================================================
-- Seed default pipeline stages (run only when table is empty)
-- =============================================================================

insert into public.pipeline_stages (name, position, color, is_default)
select v.name, v.position, v.color, v.is_default
from (values
  ('New', 1, '#0055FF', true),
  ('Qualified', 2, '#00CCFF', false),
  ('Proposal', 3, '#10B981', false),
  ('Negotiation', 4, '#F59E0B', false),
  ('Won', 5, '#10B981', false),
  ('Lost', 6, '#EF4444', false)
) as v(name, position, color, is_default)
where not exists (select 1 from public.pipeline_stages limit 1);

-- ========== 013_create_notifications_alert_rules.sql ==========
-- =============================================================================
-- Notifications + Alert Rules (CRM)
-- =============================================================================

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  metadata jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using ((select auth.uid()) = user_id);

create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_read_at_idx on public.notifications(read_at);
create index notifications_created_at_idx on public.notifications(created_at desc);

-- Alert rules
create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  condition_type text not null check (condition_type in ('lead_stale', 'deal_stale', 'message_unread')),
  condition_params jsonb,
  action_type text not null default 'create_notification',
  action_params jsonb,
  enabled boolean default true,
  last_triggered_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.alert_rules enable row level security;

create policy "Users can read own alert rules"
  on public.alert_rules for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own alert rules"
  on public.alert_rules for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own alert rules"
  on public.alert_rules for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own alert rules"
  on public.alert_rules for delete
  using ((select auth.uid()) = user_id);

create index alert_rules_user_id_idx on public.alert_rules(user_id);
create index alert_rules_enabled_idx on public.alert_rules(enabled);
create index alert_rules_last_triggered_at_idx on public.alert_rules(last_triggered_at);

create trigger set_alert_rules_updated_at
  before update on public.alert_rules
  for each row
  execute function public.handle_updated_at();

-- ========== 014_create_crm_reporting_functions.sql ==========
-- =============================================================================
-- CRM Reporting Functions (Dashboard)
-- =============================================================================

create or replace function public.crm_dashboard_summary(start_date date, end_date date)
returns table (
  new_customers bigint,
  new_leads bigint,
  new_messages bigint,
  open_deals bigint,
  won_deals bigint,
  lost_deals bigint,
  pipeline_value numeric,
  pipeline_open_value numeric
) language sql stable as $$
  with customers_cte as (
    select count(*) as count
    from public.customers
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  leads_cte as (
    select count(*) as count
    from public.leads
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  messages_cte as (
    select count(*) as count
    from public.messages
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  deals_cte as (
    select
      coalesce(sum(case when status = 'open' then 1 else 0 end), 0) as open_deals,
      coalesce(sum(case when status = 'won' then 1 else 0 end), 0) as won_deals,
      coalesce(sum(case when status = 'lost' then 1 else 0 end), 0) as lost_deals,
      coalesce(sum(value), 0) as pipeline_value,
      coalesce(sum(case when status = 'open' then value else 0 end), 0) as pipeline_open_value
    from public.deals
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  )
  select
    customers_cte.count,
    leads_cte.count,
    messages_cte.count,
    deals_cte.open_deals,
    deals_cte.won_deals,
    deals_cte.lost_deals,
    deals_cte.pipeline_value,
    deals_cte.pipeline_open_value
  from customers_cte, leads_cte, messages_cte, deals_cte;
$$;

create or replace function public.crm_activity_series(start_date date, end_date date)
returns table (
  date date,
  new_leads bigint,
  new_deals bigint,
  new_messages bigint
) language sql stable as $$
  with dates as (
    select generate_series(start_date, end_date, interval '1 day')::date as date
  ),
  leads_cte as (
    select created_at::date as date, count(*) as count
    from public.leads
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  ),
  deals_cte as (
    select created_at::date as date, count(*) as count
    from public.deals
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  ),
  messages_cte as (
    select created_at::date as date, count(*) as count
    from public.messages
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  )
  select
    d.date,
    coalesce(l.count, 0) as new_leads,
    coalesce(de.count, 0) as new_deals,
    coalesce(m.count, 0) as new_messages
  from dates d
  left join leads_cte l on l.date = d.date
  left join deals_cte de on de.date = d.date
  left join messages_cte m on m.date = d.date
  order by d.date;
$$;

-- ========== 015_add_profiles_role.sql ==========
-- =============================================================================
-- Add role column to profiles
-- =============================================================================

alter table public.profiles
  add column if not exists role text not null default 'viewer'
  check (role in ('admin','editor','viewer'));

-- Update new user handler to set default role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    'viewer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- ========== 016_create_crm_views_filters.sql ==========
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

-- ========== 018_create_tasks.sql ==========
-- =============================================================================
-- Tasks (CRM automation + follow-up)
-- =============================================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_at timestamp with time zone,
  entity_type text check (entity_type in ('lead','deal','message','customer')),
  entity_id uuid,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  source_rule_id uuid references public.alert_rules(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

create policy "Users can read own tasks"
  on public.tasks for select
  using ((select auth.uid()) = assigned_to);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check ((select auth.uid()) = assigned_to);

create policy "Users can update own tasks"
  on public.tasks for update
  using ((select auth.uid()) = assigned_to);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using ((select auth.uid()) = assigned_to);

create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index tasks_status_idx on public.tasks(status);
create index tasks_due_at_idx on public.tasks(due_at desc);
create index tasks_entity_idx on public.tasks(entity_type, entity_id);

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- ========== 019_create_crm_custom_fields.sql ==========
-- =============================================================================
-- CRM Custom Fields
-- =============================================================================

create table public.crm_custom_fields (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('customer','lead','deal','message')),
  name text not null,
  key text not null,
  field_type text not null check (field_type in ('text','number','date','select','multiselect','boolean','textarea','url')),
  options jsonb,
  required boolean not null default false,
  position integer not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index crm_custom_fields_entity_key_idx on public.crm_custom_fields(entity_type, key);
create index crm_custom_fields_entity_idx on public.crm_custom_fields(entity_type);
create index crm_custom_fields_position_idx on public.crm_custom_fields(position);

alter table public.crm_custom_fields enable row level security;

create trigger set_crm_custom_fields_updated_at
  before update on public.crm_custom_fields
  for each row
  execute function public.handle_updated_at();

create table public.crm_custom_field_values (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references public.crm_custom_fields(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('customer','lead','deal','message')),
  entity_id uuid not null,
  value_json jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index crm_custom_field_values_unique_idx on public.crm_custom_field_values(field_id, entity_id);
create index crm_custom_field_values_entity_idx on public.crm_custom_field_values(entity_type, entity_id);

alter table public.crm_custom_field_values enable row level security;

create trigger set_crm_custom_field_values_updated_at
  before update on public.crm_custom_field_values
  for each row
  execute function public.handle_updated_at();

-- ========== 020_extend_crm_reporting_functions.sql ==========
-- =============================================================================
-- CRM Reporting Extensions (funnel, lead source, deal aging)
-- =============================================================================

create or replace function public.crm_funnel_summary(start_date date, end_date date)
returns table (
  leads_created bigint,
  deals_created bigint,
  deals_won bigint
)
language sql
stable
as $$
  select
    (select count(*) from public.leads
      where created_at::date between start_date and end_date) as leads_created,
    (select count(*) from public.deals
      where created_at::date between start_date and end_date) as deals_created,
    (select count(*) from public.deals
      where status = 'won'
        and (coalesce(closed_at, updated_at))::date between start_date and end_date) as deals_won;
$$;

create or replace function public.crm_lead_source_performance(start_date date, end_date date)
returns table (
  source text,
  lead_count bigint,
  converted_count bigint
)
language sql
stable
as $$
  select
    coalesce(nullif(source, ''), 'Unknown') as source,
    count(*) as lead_count,
    count(*) filter (where converted_customer_id is not null) as converted_count
  from public.leads
  where created_at::date between start_date and end_date
  group by 1
  order by lead_count desc;
$$;

create or replace function public.crm_deal_aging(start_date date, end_date date)
returns table (
  bucket text,
  deal_count bigint,
  total_value numeric
)
language sql
stable
as $$
  with deals_cte as (
    select
      id,
      value,
      created_at::date as created_date,
      (current_date - created_at::date) as age_days
    from public.deals
    where status = 'open'
      and created_at::date between start_date and end_date
  )
  select
    case
      when age_days <= 7 then '0-7 days'
      when age_days <= 30 then '8-30 days'
      when age_days <= 60 then '31-60 days'
      else '61+ days'
    end as bucket,
    count(*) as deal_count,
    coalesce(sum(value), 0) as total_value
  from deals_cte
  group by 1
  order by
    case
      when bucket = '0-7 days' then 1
      when bucket = '8-30 days' then 2
      when bucket = '31-60 days' then 3
      else 4
    end;
$$;

-- ========== 021_extend_alert_rules_conditions.sql ==========
-- =============================================================================
-- Extend alert rules: conditions array + cooldown per rule + entity type
-- =============================================================================

alter table public.alert_rules
  add column if not exists entity_type text,
  add column if not exists conditions jsonb,
  add column if not exists cooldown_hours integer default 24;

create index if not exists alert_rules_entity_idx on public.alert_rules(entity_type);

update public.alert_rules
set entity_type = case
  when condition_type in ('lead_stale') then 'lead'
  when condition_type in ('deal_stale') then 'deal'
  when condition_type in ('message_unread') then 'message'
  else null
end
where entity_type is null;

update public.alert_rules
set conditions = jsonb_build_array(
  jsonb_build_object('type', condition_type, 'params', condition_params)
)
where conditions is null;

-- ========== 022_create_notification_preferences.sql ==========
-- =============================================================================
-- Notification preferences (in-app + email)
-- =============================================================================

create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  type_preferences jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can read own notification preferences"
  on public.notification_preferences for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using ((select auth.uid()) = user_id);

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.handle_updated_at();

-- ========== 023_attachments_title_note.sql ==========
-- Add optional metadata columns to attachments for Phase 1 (Upload Attachments Full UX)
alter table public.attachments
  add column if not exists title text,
  add column if not exists note text;

-- ========== 024_custom_fields_group_visibility.sql ==========
-- Phase 2: Custom Fields - group and visibility_rules for grouping and role/conditional visibility
alter table public.crm_custom_fields
  add column if not exists "group" text,
  add column if not exists visibility_rules jsonb;

comment on column public.crm_custom_fields."group" is 'Optional section/group name for form layout';
comment on column public.crm_custom_fields.visibility_rules is 'e.g. { "edit_roles": ["admin","editor"], "show_when": { "field_key": "x", "value": "y" } }';

-- ========== 025_dashboard_reports_and_rpc.sql ==========
-- =============================================================================
-- Dashboard: saved reports table + crm_stage_velocity, crm_funnel_by_source
-- =============================================================================

create table if not exists public.dashboard_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  filters jsonb not null default '{}',
  chart_options jsonb not null default '{}',
  is_default boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index dashboard_reports_user_id_idx on public.dashboard_reports(user_id);
alter table public.dashboard_reports enable row level security;

create trigger set_dashboard_reports_updated_at
  before update on public.dashboard_reports
  for each row
  execute function public.handle_updated_at();

create policy "Users can manage own dashboard_reports"
  on public.dashboard_reports for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.crm_stage_velocity(start_date date, end_date date)
returns table (
  stage_id uuid,
  stage_name text,
  deal_count bigint,
  avg_days_in_stage numeric
)
language sql stable as $$
  select
    ps.id as stage_id,
    ps.name as stage_name,
    count(d.id)::bigint as deal_count,
    coalesce(avg(extract(day from (least(coalesce(d.closed_at, now()), (end_date + interval '1 day')::timestamp) - d.created_at))), 0)::numeric as avg_days_in_stage
  from public.pipeline_stages ps
  left join public.deals d on d.pipeline_stage_id = ps.id
    and d.created_at::date between start_date and end_date
  group by ps.id, ps.name, ps.position
  order by ps.position;
$$;

create or replace function public.crm_funnel_by_source(start_date date, end_date date)
returns table (
  source text,
  leads_count bigint,
  deals_count bigint,
  won_count bigint
)
language sql stable as $$
  select
    coalesce(nullif(l.source, ''), 'Unknown') as source,
    count(distinct l.id)::bigint as leads_count,
    count(distinct d.id)::bigint as deals_count,
    count(distinct d.id) filter (where d.status = 'won')::bigint as won_count
  from public.leads l
  left join public.deals d on d.lead_id = l.id
    and d.created_at::date between start_date and end_date
  where l.created_at::date between start_date and end_date
  group by coalesce(nullif(l.source, ''), 'Unknown')
  order by leads_count desc;
$$;

-- ========== 026_alert_rules_priority_active_hours_actions.sql ==========
-- Phase 4: Automations - priority, active_hours, actions array
alter table public.alert_rules
  add column if not exists priority integer default 0,
  add column if not exists active_hours jsonb,
  add column if not exists actions jsonb default '[{"type":"create_notification","params":{}}]';

comment on column public.alert_rules.priority is 'Higher number = higher priority (run first)';
comment on column public.alert_rules.active_hours is 'e.g. {"start":"09:00","end":"18:00"} - only run within this window';
comment on column public.alert_rules.actions is 'Array of {type, params} e.g. create_notification, create_task';

-- ========== 027_add_owner_id_deals_customers.sql ==========
-- Add owner_id to deals and customers for ownership filtering and "Assign to me"

alter table public.deals
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

alter table public.customers
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

create index if not exists deals_owner_id_idx on public.deals(owner_id);
create index if not exists customers_owner_id_idx on public.customers(owner_id);

-- ========== 028_crm_saved_views_is_default_shared.sql ==========
-- Add is_default and shared to crm_saved_views for Saved Views UX

alter table public.crm_saved_views
  add column if not exists is_default boolean not null default false;

alter table public.crm_saved_views
  add column if not exists shared boolean not null default false;

-- Only one default view per user per entity_type (enforced in app when setting default)
create unique index if not exists crm_saved_views_one_default_per_user_entity
  on public.crm_saved_views (user_id, entity_type)
  where is_default = true;

-- ========== 029_create_error_logs.sql ==========
-- Observability: client and server error logging

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('client', 'server')),
  path text,
  method text,
  status_code int,
  message text,
  details jsonb,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.error_logs enable row level security;

-- No policies: only service role (API server) can insert/select; client uses POST /api/error-log

create index error_logs_created_at_idx on public.error_logs(created_at desc);
create index error_logs_source_idx on public.error_logs(source);

-- ========== 030_admin_create_account_function.sql ==========
-- Ensure profiles table exists for admin-created accounts
create table if not exists public.profiles (
  id uuid not null,
  display_name text null,
  avatar_url text null,
  phone text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
);

-- Keep updated_at helper consistent
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at trigger if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    create trigger set_updated_at
      before update on public.profiles
      for each row
      execute function public.handle_updated_at();
  END IF;
END $$;

-- Create function to auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    create trigger on_auth_user_created
      after insert on auth.users
      for each row
      execute function public.handle_new_user();
  END IF;
END $$;

-- ========== 031_add_marketplace_metadata.sql ==========
-- Add metadata column for structured marketplace listing info
alter table public.marketplace_items
  add column if not exists metadata jsonb;

comment on column public.marketplace_items.metadata is 'Structured listing metadata for specialized item types (e.g., signed jerseys).';

-- ========== 032_add_product_id_marketplace_items.sql ==========
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

-- ========== 033_storage_consign_submissions.sql ==========
-- =============================================================================
-- Storage: Bucket for public consign photo uploads (server-side via service role)
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'consign-submissions',
  'consign-submissions',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated upload policies — public routes upload via service role only (D-15)

-- ========== 035_optimize_public_browse_indexes.sql ==========
-- Phase 7: composite indexes for public marketplace browse and CRM hot paths

create index if not exists marketplace_items_public_browse_idx
  on public.marketplace_items (state_lifecycle, state_visibility, listing_category, price_amount desc)
  where state_lifecycle = 'published' and state_visibility = 'public';

create index if not exists leads_source_status_idx
  on public.leads (source, status, created_at desc);

create index if not exists consigned_items_queue_idx
  on public.consigned_items (status, created_at desc)
  where status in ('submitted', 'in_review');
