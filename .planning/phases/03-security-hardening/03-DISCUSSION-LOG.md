# Phase 3: Security Hardening - Discussion Log

> Audit trail only. Decisions in `03-CONTEXT.md`.

**Date:** 2026-06-14
**Phase:** 3-Security Hardening
**Areas discussed:** Register lockdown, Public API clients, Admin auth audit, Marketplace visibility, Abuse guards
**Mode:** auto-discuss

---

## Register Endpoint

| Option | Description | Selected |
|--------|-------------|----------|
| Disable anonymous (403) | Block public signup, admin-only user creation | ✓ |
| Admin-only guard | requireUser admin on register | |
| Delete route | Remove endpoint entirely | |

**User's choice:** [auto] Disable anonymous (403) — recommended

## Public API Client Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Anon for reads, service-role for writes | Minimize service-role exposure | ✓ |
| Service-role everywhere | Status quo | |
| Full RLS rewrite first | Block until RLS complete | |

**User's choice:** [auto] Anon reads where possible; keep service-role for public writes with validation

## Admin API Auth

| Option | Description | Selected |
|--------|-------------|----------|
| Full audit + role matrix | requireUser+requireRole on all mutations | ✓ |
| Spot-fix known gaps | Minimal | |

**User's choice:** [auto] Full audit + viewer read-only

## Marketplace Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side published+public filter | Enforce on all public queries | ✓ |
| RLS-only | Database layer only | |

**User's choice:** [auto] Server-side filter + 404 on private slugs

## Claude's Discretion

- RLS policy details for anon verify
- 403 vs 410 on register
- Lightweight rate limit approach

## Deferred Ideas

- CAPTCHA, full rate limiting, WAF — v2
