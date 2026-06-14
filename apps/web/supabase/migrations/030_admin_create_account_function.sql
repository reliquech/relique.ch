-- Ensure profiles table exists for admin-created accounts
create table if not exists public.profiles (
  id uuid not null,
  display_name text null,
  avatar_url text null,
  phone text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
);

-- Keep updated_at helper consistent
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at trigger if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    create trigger set_updated_at
      before update on public.profiles
      for each row
      execute function public.handle_updated_at();
  END IF;
END $$;

-- Create function to auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    create trigger on_auth_user_created
      after insert on auth.users
      for each row
      execute function public.handle_new_user();
  END IF;
END $$;

-- Optional helper for admins to upsert profile by user id
create or replace function public.admin_upsert_profile(
  p_user_id uuid,
  p_display_name text default null,
  p_avatar_url text default null,
  p_phone text default null
)
returns public.profiles
language plpgsql
security definer
as $$
declare
  v_profile public.profiles;
begin
  insert into public.profiles (id, display_name, avatar_url, phone)
  values (p_user_id, p_display_name, p_avatar_url, p_phone)
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    phone = excluded.phone
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.admin_upsert_profile(uuid, text, text, text) from public;
grant execute on function public.admin_upsert_profile(uuid, text, text, text) to service_role;
