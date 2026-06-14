-- Phase 2: Custom Fields - group and visibility_rules for grouping and role/conditional visibility
alter table public.crm_custom_fields
  add column if not exists "group" text,
  add column if not exists visibility_rules jsonb;

comment on column public.crm_custom_fields."group" is 'Optional section/group name for form layout';
comment on column public.crm_custom_fields.visibility_rules is 'e.g. { "edit_roles": ["admin","editor"], "show_when": { "field_key": "x", "value": "y" } }';
