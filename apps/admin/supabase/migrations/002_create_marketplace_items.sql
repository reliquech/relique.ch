-- =============================================================================
-- Marketplace Items
-- Bảng lưu sản phẩm trên marketplace (đồ sưu tầm, authenticated items, v.v.)
-- Liên kết: profiles (created_by), Storage bucket marketplace-images (image, images)
-- =============================================================================

create table public.marketplace_items (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  full_description text,
  price_usd numeric(12,2) not null check (price_usd >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  image text not null,
  images jsonb,
  category text not null,
  status text not null check (status in ('draft', 'pending', 'published', 'suspended', 'unpublished', 'archived')) default 'draft',
  authenticated boolean default false,
  certificate text,
  authenticated_date timestamp with time zone,
  coa_issuer text,
  signed_by text,
  condition text,
  provenance text,
  seller_name text,
  seller_rating numeric(3,2) check (seller_rating is null or (seller_rating >= 0 and seller_rating <= 5)),
  seller_verified boolean default false,
  is_featured boolean default false,
  featured_order integer check (featured_order is null or featured_order >= 0),
  commission_rate numeric(5,2) check (commission_rate is null or (commission_rate >= 0 and commission_rate <= 100)),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) on delete set null
);

-- Comment bảng
comment on table public.marketplace_items is 'Sản phẩm marketplace: đồ sưu tầm, có/không COA, trạng thái draft/published.';

-- Comment các cột quan trọng
comment on column public.marketplace_items.slug is 'URL-friendly identifier, unique, dùng cho route /marketplace/[slug]';
comment on column public.marketplace_items.image is 'URL ảnh chính (Storage path hoặc public URL)';
comment on column public.marketplace_items.images is 'Mảng URL ảnh phụ, JSON array of strings';
comment on column public.marketplace_items.status is 'draft: nháp, pending: chờ duyệt, published: hiển thị, suspended/unpublished/archived: ẩn/ngưng/lưu trữ';
comment on column public.marketplace_items.authenticated is 'Item đã được xác thực (COA/authenticated)';
comment on column public.marketplace_items.featured_order is 'Thứ tự hiển thị khi is_featured = true, số nhỏ ưu tiên trước';
comment on column public.marketplace_items.commission_rate is 'Phần trăm hoa hồng platform (0-100)';
comment on column public.marketplace_items.created_by is 'Admin/user tạo bản ghi, null khi xóa profile';

-- Enable RLS
alter table public.marketplace_items enable row level security;

-- Policy SELECT: published cho mọi người, draft/pending chỉ cho người tạo (1 policy để tránh multiple permissive)
create policy "Select published or own drafts"
  on public.marketplace_items for select
  using (
    (status = 'published')
    or ((select auth.uid()) = created_by and status in ('draft', 'pending'))
  );

-- Indexes
create index marketplace_items_slug_idx on public.marketplace_items(slug);
create index marketplace_items_status_idx on public.marketplace_items(status);
create index marketplace_items_category_idx on public.marketplace_items(category);
create index marketplace_items_is_featured_idx on public.marketplace_items(is_featured);
create index marketplace_items_created_at_idx on public.marketplace_items(created_at desc);
create index marketplace_items_created_by_idx on public.marketplace_items(created_by);

-- Trigger cập nhật updated_at
create trigger set_marketplace_items_updated_at
  before update on public.marketplace_items
  for each row
  execute function public.handle_updated_at();
