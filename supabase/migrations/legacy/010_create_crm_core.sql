-- =============================================================================
-- CRM Core Tables: customers, leads, deals, pipeline_stages, messages, attachments
-- =============================================================================

-- Customers
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text,
  company text,
  address text,
  tags text[],
  notes text,
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text,
  company text,
  source text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'unqualified')) default 'new',
  score integer default 0,
  last_contacted_at timestamp with time zone,
  owner_id uuid references public.profiles(id) on delete set null,
  converted_customer_id uuid references public.customers(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Pipeline stages
create table public.pipeline_stages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  position integer not null default 1,
  color text,
  is_default boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Deals
create table public.deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  pipeline_stage_id uuid references public.pipeline_stages(id) on delete set null,
  value numeric(12,2),
  currency text not null default 'USD',
  probability integer default 0,
  expected_close_date date,
  status text not null check (status in ('open', 'won', 'lost')) default 'open',
  closed_at timestamp with time zone,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages (contact inquiries)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null check (status in ('new', 'open', 'pending', 'closed')) default 'new',
  source text,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Attachments (generic links to storage objects)
create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null,
  entity_id text not null,
  file_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

-- Indexes
create index customers_email_idx on public.customers(email);
create index customers_status_idx on public.customers(status);
create index customers_created_at_idx on public.customers(created_at desc);

create index leads_email_idx on public.leads(email);
create index leads_status_idx on public.leads(status);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_created_at_idx on public.leads(created_at desc);

create index pipeline_stages_position_idx on public.pipeline_stages(position);

create index deals_status_idx on public.deals(status);
create index deals_stage_id_idx on public.deals(pipeline_stage_id);
create index deals_customer_id_idx on public.deals(customer_id);
create index deals_created_at_idx on public.deals(created_at desc);

create index messages_status_idx on public.messages(status);
create index messages_email_idx on public.messages(email);
create index messages_created_at_idx on public.messages(created_at desc);

create index attachments_entity_idx on public.attachments(entity_type, entity_id);

-- updated_at triggers
create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.handle_updated_at();

create trigger set_leads_updated_at
  before update on public.leads
  for each row
  execute function public.handle_updated_at();

create trigger set_pipeline_stages_updated_at
  before update on public.pipeline_stages
  for each row
  execute function public.handle_updated_at();

create trigger set_deals_updated_at
  before update on public.deals
  for each row
  execute function public.handle_updated_at();

create trigger set_messages_updated_at
  before update on public.messages
  for each row
  execute function public.handle_updated_at();
