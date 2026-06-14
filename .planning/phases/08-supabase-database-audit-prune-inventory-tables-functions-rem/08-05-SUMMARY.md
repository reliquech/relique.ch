# 08-05 Summary

**Plan:** Types regen + smoke + docs  
**Status:** Partial — manual types prune; CLI regen blocked

## Done
- Removed `email_logs` from `src/lib/supabase/types.ts` (post-036 target state)
- `scripts/smoke-supabase.mjs` + `npm run smoke:supabase`
- `npm run check-types` passes

## Blocked
- `supabase gen types` — no linked project / access token
- Migration 036 remote apply — same as Phase 7 (run `supabase link` + `db push`)

## Manual close
```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push   # applies 036 on brownfield
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```
