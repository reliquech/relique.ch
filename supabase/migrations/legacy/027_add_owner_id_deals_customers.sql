-- Add owner_id to deals and customers for ownership filtering and "Assign to me"

alter table public.deals
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

alter table public.customers
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

create index if not exists deals_owner_id_idx on public.deals(owner_id);
create index if not exists customers_owner_id_idx on public.customers(owner_id);
