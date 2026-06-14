# Phase 6: Flat Root App & npm Simplify - Discussion Log

> Audit trail only. Decisions in `06-CONTEXT.md`.

**Date:** 2026-06-14
**Phase:** 6-Flat Root App & npm Simplify
**Areas discussed:** Execution priority, Directory layout, npm tooling, Package inlining, Legacy deletion, Dependency upgrades
**Mode:** auto-discuss (user-requested restructure)

---

## Execution Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Run after Phase 2 (reorder) | User: "giờ restructure" | ✓ |
| Wait until Phase 5 | Default roadmap depends-on | |

**User's choice:** [auto] Allow early execution after Phase 2 — user explicit intent

## Directory Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Flat root src/ + supabase/ + public/ | Standard Next.js single-app | ✓ |
| Keep apps/web shell | User rejected | |

**User's choice:** [auto] Full flatten to repo root

## Package Manager

| Option | Description | Selected |
|--------|-------------|----------|
| npm only, no turbo/pnpm | User requested simplify | ✓ |
| Keep pnpm single package | | |
| Keep turborepo | User rejected | |

**User's choice:** [auto] npm + delete turbo.json + pnpm-workspace.yaml

## Workspace Packages

| Option | Description | Selected |
|--------|-------------|----------|
| Inline shared + ui into src/lib/ | No workspace packages | ✓ |
| Keep packages/ as npm workspaces | User rejected monorepo | |

**User's choice:** [auto] Inline to src/lib/domain and src/lib/ui

## Legacy Deletion

| Option | Description | Selected |
|--------|-------------|----------|
| Delete apps/admin + relique-marketplace + apps/ | CONS-01/02 | ✓ |
| Archive to docs/prototypes | | |

**User's choice:** [auto] Delete from repo

## Dependency Upgrades

| Option | Description | Selected |
|--------|-------------|----------|
| Latest stable, build must pass | User requested latest packages | ✓ |
| Pin current versions, move only | | |

**User's choice:** [auto] Upgrade direct deps to latest stable with build gate

## Claude's Discretion

- Codemod vs manual import updates
- Node 18 vs 20 engines
- src/lib/ui vs src/components/ui for shadcn

## Deferred Ideas

- npm workspaces for future libs — v2
