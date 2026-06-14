-- Corrective migration: sửa RLS theo Supabase linter (auth_rls_initplan + multiple_permissive_policies)
-- Idempotent: dùng drop policy if exists để chạy được trên DB mới (đã có policy từ 001/002) và DB cũ (còn policy tên cũ)

-- profiles: dùng (select auth.uid()) thay vì auth.uid() để initplan, cache 1 lần/query
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- marketplace_items: gộp 2 policy SELECT thành 1 (tránh multiple permissive)
drop policy if exists "Select published or own drafts" on public.marketplace_items;
drop policy if exists "Public can view published items" on public.marketplace_items;
drop policy if exists "Users can view own draft items" on public.marketplace_items;

create policy "Select published or own drafts"
  on public.marketplace_items for select
  using (
    (state_lifecycle = 'published' and state_visibility in ('public', 'unlisted'))
    or ((select auth.uid()) = created_by)
  );
