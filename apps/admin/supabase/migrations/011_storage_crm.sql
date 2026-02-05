-- =============================================================================
-- Storage: Bucket for CRM attachments (documents, images)
-- =============================================================================

-- Create bucket (private by default)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'crm-attachments',
  'crm-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- If schema doesn't support file_size_limit / allowed_mime_types, use reduced version:
-- insert into storage.buckets (id, name, public)
-- values ('crm-attachments', 'crm-attachments', false)
-- on conflict (id) do update set public = excluded.public;

-- Policies (service role bypasses RLS, but keep for authenticated access)
create policy "Authenticated read crm attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'crm-attachments');

create policy "Authenticated upload crm attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'crm-attachments');

create policy "Authenticated update crm attachments"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'crm-attachments');

create policy "Authenticated delete crm attachments"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'crm-attachments');
