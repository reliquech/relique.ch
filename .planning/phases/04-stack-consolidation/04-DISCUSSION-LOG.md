# Phase 4: Stack Consolidation - Discussion Log

> Audit trail only. Decisions in `04-CONTEXT.md`.

**Date:** 2026-06-14
**Phase:** 4-Stack Consolidation
**Areas discussed:** Phase 6 overlap, Schema consolidation, UI package, Type safety, Mock cleanup
**Mode:** auto-discuss

---

## Phase 6 Overlap

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 6 owns delete/inline | CONS-01/02/04 in Phase 6; Phase 4 = schema+types+mocks | ✓ |
| Duplicate in both phases | Risk double work | |

**User's choice:** [auto] Phase 6 owns legacy delete + package inline

## Schema Consolidation

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate to @relique/shared then inline in Phase 6 | Pre-flatten codemod | |
| Inline directly in Phase 6; Phase 4 cleans paths | Post-flatten cleanup | ✓ |

**User's choice:** [auto] Phase 4 adapts to flat `src/lib/domain` if Phase 6 ran first

## Type Safety (DATA-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Regenerate types + 50% @ts-expect-error reduction | Targeted cleanup | ✓ |
| Full zero suppressions | Too large for one phase | |

**User's choice:** [auto] Regenerate + 50% reduction target

## Mock Cleanup (CONS-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Disable watchlist fake notifications | Remove trust-breaking behavior | ✓ |
| Remove all watchlist UI | Too aggressive | |

**User's choice:** [auto] Disable fake notifications; keep toggle UI

## Claude's Discretion

- Codemod tooling for schema imports
- Route priority for @ts-expect-error fixes

## Deferred Ideas

- Test framework, full file splits — v2/backlog
