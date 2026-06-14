-- Add is_default and shared to crm_saved_views for Saved Views UX

alter table public.crm_saved_views
  add column if not exists is_default boolean not null default false;

alter table public.crm_saved_views
  add column if not exists shared boolean not null default false;

-- Only one default view per user per entity_type (enforced in app when setting default)
create unique index if not exists crm_saved_views_one_default_per_user_entity
  on public.crm_saved_views (user_id, entity_type)
  where is_default = true;
