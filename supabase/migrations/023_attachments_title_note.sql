-- Add optional metadata columns to attachments for Phase 1 (Upload Attachments Full UX)
alter table public.attachments
  add column if not exists title text,
  add column if not exists note text;
