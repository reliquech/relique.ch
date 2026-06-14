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

