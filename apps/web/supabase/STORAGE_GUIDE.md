# Hướng dẫn thêm Storage vào Database (Supabase)

## Tổng quan

- **Bảng `marketplace_items`** lưu sản phẩm; cột `image` và `images` (JSONB) chứa **đường dẫn file** (path) trong Storage, không lưu file binary trong DB.
- **Storage** (bucket `marketplace-images`) lưu file ảnh thật; database chỉ lưu metadata và path để app hiển thị ảnh.

Migration đã tạo sẵn:
- `002_create_marketplace_items.sql` – bảng marketplace items (đã bổ sung comment, check constraints).
- `008_storage_marketplace.sql` – bucket `marketplace-images` + RLS policies cho Storage.

---

## 1. Chạy migration (thêm Storage vào database)

### Cách 1: Supabase CLI (khuyến nghị)

```bash
cd apps/admin
npx supabase db push
```

Hoặc nếu dùng link tới project:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Migration `008_storage_marketplace.sql` sẽ:
1. Tạo bucket **marketplace-images** (public, 5MB/file, chỉ ảnh).
2. Tạo policies: public đọc ảnh; authenticated upload/update/delete.

### Cách 2: Chạy SQL thủ công trên Dashboard

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → project → **SQL Editor**.
2. Mở file `apps/admin/supabase/migrations/008_storage_marketplace.sql`, copy toàn bộ nội dung.
3. Paste vào SQL Editor và chạy **Run**.

Nếu gặp lỗi kiểu **column "file_size_limit" does not exist** (schema cũ):
- Dùng đoạn “phiên bản rút gọn” trong chính file migration (chỉ `id`, `name`, `public`).
- Sau đó vào **Storage** trên Dashboard → bucket `marketplace-images` → Settings để set **file size limit** và **allowed MIME types** bằng tay.

---

## 2. Cách lưu ảnh từ app vào Storage và ghi path vào DB

### Bước 1: Upload file lên Storage

Dùng Supabase Client (service role cho admin, hoặc authenticated user):

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // admin: dùng service role
);

const file = event.target.files[0]; // File object từ input
const path = `marketplace/${itemId}/${file.name}`; // hoặc uuid() cho tên unique

const { data, error } = await supabase.storage
  .from('marketplace-images')
  .upload(path, file, { upsert: true });

if (error) throw error;

// data.path = đường dẫn dùng để lưu vào DB và hiển thị
const publicUrl = supabase.storage.from('marketplace-images').getPublicUrl(data.path).data.publicUrl;
```

### Bước 2: Ghi path (hoặc public URL) vào bảng `marketplace_items`

- **Cột `image`**: path hoặc URL ảnh chính (bắt buộc).
- **Cột `images`**: JSONB mảng path/URL ảnh phụ, ví dụ `["path/a.jpg", "path/b.jpg"]`.

Ví dụ insert/update:

```ts
await supabase.from('marketplace_items').insert({
  slug: 'my-item',
  title: 'My Item',
  description: 'Short desc',
  image: publicUrl, // hoặc data.path nếu bạn build URL ở frontend
  images: [publicUrl1, publicUrl2],
  category: 'art',
  status: 'draft',
  price_usd: 99.99,
  created_by: userId,
});
```

**Lưu ý:** Nếu dùng **path** thay vì full URL thì khi hiển thị cần build URL:

```ts
const url = supabase.storage.from('marketplace-images').getPublicUrl(row.image).data.publicUrl;
```

---

## 3. Cấu trúc bucket và path gợi ý

- Bucket: **marketplace-images** (đã tạo trong migration).
- Path gợi ý: `marketplace/{item_id}/{filename}` hoặc `marketplace/{item_id}/{uuid}.{ext}` để tránh trùng tên.

Ví dụ:
- Ảnh chính: `marketplace/abc-123/main.webp`
- Ảnh phụ: `marketplace/abc-123/1.webp`, `marketplace/abc-123/2.webp`

Lưu trong DB:
- `image` = `marketplace/abc-123/main.webp` (hoặc full public URL).
- `images` = `["marketplace/abc-123/1.webp", "marketplace/abc-123/2.webp"]`.

---

## 4. Thêm bucket mới (ví dụ: avatar, private)

Tạo migration mới, ví dụ `009_storage_avatars.sql`:

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');
```

Sau đó chạy `npx supabase db push` hoặc chạy SQL trong Dashboard như mục 1.

---

## 5. Tóm tắt luồng “thêm Storage vào database”

1. **Đã có trong repo:** migration bảng `marketplace_items` (002) và migration Storage bucket + policies (008).
2. **Chạy migration:** `npx supabase db push` hoặc chạy SQL trong Dashboard.
3. **Trong app:** upload file vào bucket `marketplace-images`, lấy path/URL rồi ghi vào cột `image` và `images` của `marketplace_items`.
4. **Hiển thị:** dùng `getPublicUrl(path)` hoặc lưu sẵn full URL trong DB và dùng trực tiếp.

Nếu bạn muốn thêm bucket khác hoặc đổi tên/giới hạn bucket, chỉ cần thêm hoặc sửa migration tương tự `008_storage_marketplace.sql` và push lại.
