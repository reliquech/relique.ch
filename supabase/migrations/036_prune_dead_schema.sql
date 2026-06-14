-- =============================================================================
-- Phase 8: prune dead schema (Resend removed, unused RPC)
-- Evidence: supabase/SUPABASE_USAGE.md prune queue
-- Safe on DBs that never had email_logs (IF EXISTS guards)
-- =============================================================================

-- 1. email_logs (migrations 017, 034) — zero app refs; Resend removed from v1
drop policy if exists "Users can read own email logs" on public.email_logs;
drop policy if exists "Users can insert own email logs" on public.email_logs;
drop table if exists public.email_logs cascade;

-- 2. admin_upsert_profile RPC (migration 030) — NOT handle_updated_at / handle_new_user
drop function if exists public.admin_upsert_profile(uuid, text, text, text);
