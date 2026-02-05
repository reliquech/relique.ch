# Deploy Admin Dashboard

Hướng dẫn triển khai **Admin Dashboard** (Relique CRM) lên Vercel/Netlify hoặc môi trường tương tự. Chi tiết env và checklist đầy đủ xem trong [README.md](./README.md#deploy-checklist-production).

## Biến môi trường (bắt buộc)

Trên hosting (Vercel → Settings → Environment Variables, v.v.) cần set:

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase (phải **trùng** với project bạn dùng khi chạy local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key của project đó |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (chỉ dùng server-side) |
| `RESEND_API_KEY` | API key Resend (email) |
| `RESEND_FROM_EMAIL` | Email gửi đi (ví dụ `support@relique.co`) |

**Quan trọng:** `NEXT_PUBLIC_SUPABASE_URL` phải trỏ đúng project Supabase đang chạy (custom domain hoặc `https://<project-ref>.supabase.co`). Nếu sai, request từ server sẽ gọi sai hostname và dễ gặp lỗi DNS/network.

## Lỗi thường gặp khi deploy

### `ENOTFOUND ... supabase.co` / `TypeError: fetch failed`

- **Nguyên nhân:** Hostname trong `NEXT_PUBLIC_SUPABASE_URL` không phân giải được DNS từ môi trường deploy (URL sai, project đã xóa, hoặc env chưa set/khác với local).
- **Cách xử lý:**
  1. Vào **Settings → Environment Variables** của project trên Vercel/Netlify.
  2. Kiểm tra `NEXT_PUBLIC_SUPABASE_URL`: copy **chính xác** giá trị từ `.env.local` (nơi `pnpm dev` chạy được).
  3. Đảm bảo `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY` cũng thuộc **cùng project** đó.
  4. Lưu và **Redeploy** (Deployments → … → Redeploy).

Sau khi sửa env và redeploy, lỗi `ENOTFOUND` sẽ hết nếu URL và key đúng.

## Root directory (monorepo)

Nếu deploy từ repo gốc (monorepo):

- **Vercel:** Project Settings → General → **Root Directory** = `apps/admin`.
- **Netlify:** Build settings → **Base directory** = `apps/admin`.

Build command: `pnpm build` (hoặc `npm run build`). Output: `.next` trong `apps/admin`.

## Health check sau khi deploy

Gọi:

```http
GET https://<your-deploy-domain>/api/health
```

Kỳ vọng: `{ "ok": true, "db": "ok" }`. Nếu `db` lỗi, kiểm tra lại Supabase URL và key.
