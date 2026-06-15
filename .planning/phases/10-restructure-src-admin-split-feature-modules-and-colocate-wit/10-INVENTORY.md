# Phase 10 — file move map (baseline 2026-06-15)
# grep baseline: @/admin/ in 45 files; src/admin/ 84 files

## Target layout
- `src/app/admin/**` — thin re-exports only
- `src/components/admin/{domain}/` — UI
- `src/features/{domain}/` — services, hooks, types, schemas
- `src/components/admin/shell/` — PortalSidebar, AdminPortalLayout

## Baseline
| Pattern | Files |
|---------|-------|
| `@/admin/` | 45 |
| `src/admin/` exists | yes (84 files) |

## Split required (>300 lines)
- `admin/marketplace/components/MarketplaceForm.tsx` — split in wave 4
- `admin/crm/pages/LeadsPage.tsx` — split in wave 5
- `admin/crm/pages/CustomersPage.tsx` — split in wave 5

## Domain move map

### users → features/users + components/admin/users
| From | To |
|------|-----|
| admin/users/services/* | features/users/services/ |
| admin/users/hooks/* | features/users/hooks/ |
| admin/users/types.ts | features/users/types.ts |
| admin/users/pages/* | components/admin/users/pages/ |

### notifications
| admin/notifications/components/* | components/admin/notifications/components/ |
| admin/notifications/services/* | features/notifications/services/ |
| admin/notifications/types.ts | features/notifications/types.ts |

### shell
| components/admin/PortalSidebar.tsx | components/admin/shell/PortalSidebar.tsx |
| components/admin/AdminPortalLayout.tsx | components/admin/shell/AdminPortalLayout.tsx |

### dashboard
| admin/dashboard/pages/* | components/admin/dashboard/pages/ |
| admin/dashboard/components/* | components/admin/dashboard/components/ |
| admin/dashboard/services/* | features/dashboard/services/ |
| admin/dashboard/types.ts | features/dashboard/types.ts |

### submissions
| admin/submissions/pages/* | components/admin/submissions/pages/ |
| admin/submissions/components/* | components/admin/submissions/components/ |
| admin/submissions/services/* | features/submissions/services/ |
| admin/submissions/types.ts | features/submissions/types.ts |

### marketplace
| admin/marketplace/pages/* | components/admin/marketplace/pages/ |
| admin/marketplace/components/* | components/admin/marketplace/ |
| admin/marketplace/hooks/* | features/marketplace/hooks/ |
| admin/marketplace/services/* | features/marketplace/services/ |
| admin/marketplace/schema.ts | features/marketplace/schema.ts |
| admin/marketplace/types.ts | features/marketplace/types.ts |
| admin/marketplace/constants.ts | DELETE (use features/marketplace/constants.ts) |
| admin/marketplace/utils/uploadPaths.ts | DELETE (use features/marketplace/utils/uploadPaths.ts) |
| components/admin/marketplace-form/* | components/admin/marketplace/form/ |

### crm
| admin/crm/pages/* | components/admin/crm/pages/ |
| admin/crm/components/* | components/admin/crm/components/ |
| admin/crm/services/* | features/crm/services/ |
| admin/crm/hooks/* | features/crm/hooks/ |
| admin/crm/schemas.ts | features/crm/schemas.ts |
| admin/crm/types.ts | DELETE (use features/crm/types.ts) |
| components/shared/CrmViewBar.tsx | components/admin/crm/CrmViewBar.tsx |
