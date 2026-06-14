-- Phase 4: Automations - priority, active_hours, actions array
alter table public.alert_rules
  add column if not exists priority integer default 0,
  add column if not exists active_hours jsonb,
  add column if not exists actions jsonb default '[{"type":"create_notification","params":{}}]';

comment on column public.alert_rules.priority is 'Higher number = higher priority (run first)';
comment on column public.alert_rules.active_hours is 'e.g. {"start":"09:00","end":"18:00"} - only run within this window';
comment on column public.alert_rules.actions is 'Array of {type, params} e.g. create_notification, create_task';
