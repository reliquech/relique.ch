-- =============================================================================
-- Add role column to profiles
-- =============================================================================

alter table public.profiles
  add column if not exists role text not null default 'viewer'
  check (role in ('admin','editor','viewer'));

-- Update new user handler: first account becomes admin, rest default to viewer
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role text := 'viewer';
begin
  if not exists (select 1 from public.profiles where role = 'admin') then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    assigned_role
  );
  return new;
end;
$$ language plpgsql security definer;
