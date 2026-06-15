# Debug: marketplace create — Forbidden (403)

**Status:** DEBUG COMPLETE

## Symptoms

- Form submit fails after upload finalize succeeds
- Console: `Forbidden` from `handleSubmit` → `POST /api/marketplace`
- User is authenticated (can access `/admin`, upload works)

## Root cause

`POST /api/marketplace` calls `requireRole({ allow: ["admin", "editor"] })`.

Fresh installs assign `profiles.role = 'viewer'` by default. Middleware only checks auth, not role — so admin UI is reachable but write APIs return **403 Forbidden**.

## Fix

1. **`requireRole.ts`** — bootstrap: if zero admins exist, auto-promote requesting user to `admin` once.
2. **`000_baseline.sql`** — `handle_new_user`: first signup gets `admin`, subsequent users get `viewer`.
3. **Error UX** — API returns `details` with required roles; page shows `error.details` in toast.

## Manual fallback (if another admin already exists)

```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

## Files

- `src/lib/supabase/requireRole.ts`
- `src/app/admin/(portal)/marketplace/new/page.tsx`
- `src/admin/marketplace/pages/NewMarketplacePage.tsx`
- `supabase/migrations/000_baseline.sql`
