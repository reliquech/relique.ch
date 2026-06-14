-- Create consigned_items table
create table public.consigned_items (
  id uuid default gen_random_uuid() primary key,
  marketplace_item_id uuid references public.marketplace_items(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_address text,
  item_description text not null,
  category text,
  estimated_value numeric(12,2),
  appraisal_date timestamp with time zone,
  coa_issuer text,
  verification_status text,
  commission_rate numeric(5,2),
  listing_fee numeric(12,2),
  contract_date timestamp with time zone,
  status text not null check (status in ('draft', 'submitted', 'in_review', 'approved', 'rejected')) default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS
alter table public.consigned_items enable row level security;

-- Admin-only access (handled via service role in API routes)
-- RLS is enabled but service role bypasses it

-- Create indexes
create index consigned_items_marketplace_item_id_idx on public.consigned_items(marketplace_item_id);
create index consigned_items_status_idx on public.consigned_items(status);
create index consigned_items_contact_email_idx on public.consigned_items(contact_email);
create index consigned_items_created_at_idx on public.consigned_items(created_at desc);
create index consigned_items_created_by_idx on public.consigned_items(created_by);

-- Create trigger for updated_at
create trigger set_consigned_items_updated_at
  before update on public.consigned_items
  for each row
  execute function public.handle_updated_at();

