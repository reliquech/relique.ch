-- =============================================================================
-- Storage: Bucket for public consign photo uploads (server-side via service role)
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'consign-submissions',
  'consign-submissions',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated upload policies — public routes upload via service role only (D-15)
