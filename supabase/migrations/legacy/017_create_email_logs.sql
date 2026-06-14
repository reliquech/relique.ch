-- =============================================================================
-- Email logs (outbound)
-- =============================================================================

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('customer','lead')),
  entity_id uuid not null,
  to_email text not null,
  subject text not null,
  body text,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null default 'sent',
  created_at timestamp with time zone default now()
);

alter table public.email_logs enable row level security;

create policy "Users can read own email logs"
  on public.email_logs for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own email logs"
  on public.email_logs for insert
  with check ((select auth.uid()) = user_id);

create index email_logs_user_id_idx on public.email_logs(user_id);
create index email_logs_entity_idx on public.email_logs(entity_type, entity_id);
create index email_logs_created_at_idx on public.email_logs(created_at desc);
