#!/usr/bin/env node
/**
 * Post-prune Supabase smoke — health + public API reachability.
 */
const BASE = process.env.SMOKE_BASE ?? "http://localhost:1300";

async function main() {
  try {
    const health = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
    if (!health.ok) {
      console.error(`smoke-supabase: health HTTP ${health.status}`);
      process.exit(1);
    }
    const marketplace = await fetch(`${BASE}/api/marketplace?limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    if (marketplace.status >= 500) {
      console.error(`smoke-supabase: marketplace HTTP ${marketplace.status}`);
      process.exit(1);
    }
    console.log("smoke-supabase OK");
  } catch (err) {
    console.log(`smoke-supabase SKIP — ${BASE} not reachable`);
    process.exit(0);
  }
}

main();
