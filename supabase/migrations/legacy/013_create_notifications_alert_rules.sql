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
