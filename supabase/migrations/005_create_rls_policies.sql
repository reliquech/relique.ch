-- Additional RLS policies (most are created in table migrations)
-- This file contains any additional policies needed

-- Marketplace items SELECT: đã gộp vào policy "Select published or own drafts" trong 002_create_marketplace_items.sql

-- Consigned items: No public access (admin-only via service role)
-- This is intentionally left empty as all access is via service role

-- Audit logs: No public access (admin-only via service role)
-- This is intentionally left empty as all access is via service role

