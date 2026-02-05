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
