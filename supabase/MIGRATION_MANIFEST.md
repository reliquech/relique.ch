# Migration Manifest

Incremental chain for Relique.co unified platform. **Do not reorder** files already applied in production.

## Core schema (001–012)

| File | Purpose |
|------|---------|
| 001 | `profiles` |
| 002 | `marketplace_items` |
| 003 | `consigned_items` |
| 004 | `audit_logs` |
| 005 | RLS policies (initial) |
| 006 | Performance indexes |
| 007 | Triggers |
| 008 | Storage: marketplace bucket |
| 009 | RLS performance fixes *(overlaps 005 — keep both for applied DBs)* |
| 010 | CRM core (`leads`, `deals`, `customers`, `messages`, …) |
| 011 | Storage: CRM attachments |
| 012 | Seed pipeline stages |

## CRM & reporting (013–022)

| File | Purpose |
|------|---------|
| 013 | Notifications + alert rules |
| 014 | CRM reporting RPCs *(extended by 020, 025)* |
| 015 | Profiles `role` column |
| 016 | CRM views + filters |
| 017 | `email_logs` |
| 018 | Tasks |
| 019 | Custom fields |
| 020 | Extend reporting functions |
| 021 | Alert rules conditions |
| 022 | Notification preferences |

## Extensions (023–031)

| File | Purpose |
|------|---------|
| 023–031 | Attachments metadata, custom fields visibility, dashboard reports, alert rules actions, owner IDs, saved views, error logs, admin create account, marketplace metadata |

## Public flows (032–034)

| File | Purpose |
|------|---------|
| 032 | `product_id` + verify indexes |
| 033 | `consign-submissions` storage bucket |
| 034 | `email_logs.user_id` nullable |

## Optimization (035)

| File | Purpose |
|------|---------|
| 035 | Public browse + CRM queue composite indexes |

## Overlap notes (Phase 7)

- **RLS:** `005` + `009` — `009` patches performance; do not squash on live DBs
- **RPC:** `014` → `020` → `025` — additive `create or replace function`; safe chain
- **Storage:** `008` (marketplace), `011` (CRM), `033` (consign public uploads)

## Fresh install baseline (future)

Squashing 001–035 into a single `000_baseline.sql` is **deferred** until all production envs share a known migration version. New projects should apply the full chain until baseline is published.
