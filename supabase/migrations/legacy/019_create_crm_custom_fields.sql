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
