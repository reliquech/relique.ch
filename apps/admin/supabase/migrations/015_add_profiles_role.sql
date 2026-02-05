-- =============================================================================
-- Add role column to profiles
-- =============================================================================

alter table public.profiles
  add column if not exists role text not null default 'viewer'
  check (role in ('admin','editor','viewer'));

-- Update new user handler to set default role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    'viewer'
  );
  return new;
end;
$$ language plpgsql security definer;
