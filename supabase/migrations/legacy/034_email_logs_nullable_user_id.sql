-- Allow system-triggered emails from public routes without authenticated user (Phase 2)
alter table public.email_logs
  alter column user_id drop not null;

comment on column public.email_logs.user_id is
  'Nullable for system-triggered transactional emails (consign/contact public routes).';
