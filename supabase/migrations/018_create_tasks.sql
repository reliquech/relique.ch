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
