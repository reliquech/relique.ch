-- Observability: client and server error logging

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('client', 'server')),
  path text,
  method text,
  status_code int,
  message text,
  details jsonb,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.error_logs enable row level security;

-- No policies: only service role (API server) can insert/select; client uses POST /api/error-log

create index error_logs_created_at_idx on public.error_logs(created_at desc);
create index error_logs_source_idx on public.error_logs(source);
