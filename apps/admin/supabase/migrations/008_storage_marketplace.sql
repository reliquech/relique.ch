-- =============================================================================
-- Storage: Bucket cho ảnh Marketplace Items
-- Dùng để lưu ảnh sản phẩm (image, images) tham chiếu từ public.marketplace_items
-- Upload qua Admin app (service role) hoặc authenticated user có quyền
-- =============================================================================

-- Tạo bucket marketplace-images (public = true để frontend hiển thị ảnh không cần signed URL)
-- file_size_limit: 5242880 = 5MB; allowed_mime_types: chỉ ảnh
-- Nếu báo lỗi cột không tồn tại, dùng phiên bản rút gọn bên dưới (chỉ id, name, public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-images',
  'marketplace-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Phiên bản rút gọn (bỏ file_size_limit, allowed_mime_types) nếu schema không có cột:
-- insert into storage.buckets (id, name, public)
-- values ('marketplace-images', 'marketplace-images', true)
-- on conflict (id) do update set public = excluded.public;

-- RLS đã bật mặc định trên storage.objects. Tạo policy cho bucket marketplace-images:

-- 1) Mọi người (kể cả anonymous) được xem ảnh trong bucket (phục vụ trang public)
create policy "Public read marketplace images"
  on storage.objects for select
  using (bucket_id = 'marketplace-images');

-- 2) Chỉ authenticated user được upload (admin app dùng service role hoặc user đăng nhập)
create policy "Authenticated upload marketplace images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'marketplace-images');

-- 3) Authenticated user được cập nhật/xóa file trong bucket (admin quản lý ảnh)
create policy "Authenticated update marketplace images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'marketplace-images');

create policy "Authenticated delete marketplace images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'marketplace-images');
