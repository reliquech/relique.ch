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
