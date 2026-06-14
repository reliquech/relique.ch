# Phase 1: Foundation & App Merge - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 1-Foundation & App Merge
**Areas discussed:** Code placement, Auth entry

---

## Code Placement

### Admin business code root

| Option | Description | Selected |
|--------|-------------|----------|
| src/features/ (Recommended) | Giữ pattern hiện tại apps/admin | |
| src/admin/ | Tách biệt rõ admin domain | ✓ |
| Hybrid | src/admin/features/ | |

**User's choice:** `src/admin/`
**Notes:** User override research default (`src/features/`)

### Admin shell components

| Option | Description | Selected |
|--------|-------------|----------|
| components/admin/ | Shell UI tách khỏi features | ✓ |
| Trong features/ | Mỗi feature tự chứa components | |
| Bạn quyết định | Miễn không sửa components/ui/ | |

**User's choice:** `components/admin/`

### Internal src/admin/ structure

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror features/ | crm/, marketplace/, submissions/ | |
| Flat by layer | pages/, services/, components/ | |
| Bạn quyết định | Mirror pattern hiện tại là đủ | ✓ |

**User's choice:** Claude's discretion — mirror existing features pattern

### Public code changes

| Option | Description | Selected |
|--------|-------------|----------|
| Tối thiểu | Chỉ wrap (site)/, không đụng public components | ✓ |
| Relocate shared | Di chuyển shared vào components/shared/ | |
| Bạn quyết định | | |

**User's choice:** Minimal — wrap routes into `(site)` only

---

## Auth Entry

### Login page URL

| Option | Description | Selected |
|--------|-------------|----------|
| /login root (Recommended) | Giữ như apps/admin hiện tại | |
| /admin/login | Nested trong admin segment | ✓ |
| Cả hai | Redirect giữa hai paths | |

**User's choice:** `/admin/login`

### Post-login redirect

| Option | Description | Selected |
|--------|-------------|----------|
| /admin dashboard | Luôn về dashboard | ✓ |
| redirect query param | Về URL gốc nếu có ?redirect= | |
| Last visited page | Nhớ session redirect | |

**User's choice:** Always `/admin` dashboard

### Unauthenticated /admin/* redirect

| Option | Description | Selected |
|--------|-------------|----------|
| /admin/login?redirect=... (Recommended) | Consistent với nested login | ✓ |
| /login?redirect=... | Root login path | |
| Bạn quyết định | | |

**User's choice:** `/admin/login?redirect={original_path}`

### Middleware scope

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ /admin/* | Public routes không qua auth | |
| Session refresh toàn app | Refresh cookie mọi route, guard /admin | |
| Bạn quyết định | | ✓ |

**User's choice:** Claude's discretion (recommended: refresh all, guard /admin only)

---

## Claude's Discretion

- Internal `src/admin/` folder structure (mirror features pattern)
- Middleware implementation details
- Turbo/tsconfig path alias updates
- Dependency merge conflicts between web and admin package.json

## Deferred Ideas

None.
