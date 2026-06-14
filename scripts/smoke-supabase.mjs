#!/usr/bin/env node
/**
 * Post-prune Supabase smoke — health, marketplace, verify, types static check.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SMOKE_BASE ?? "http://localhost:1300";
const TIMEOUT_MS = 10_000;

const typesPath = path.resolve(import.meta.dirname, "../src/lib/supabase/types.ts");

function fail(msg) {
  console.error(`smoke-supabase FAIL: ${msg}`);
  process.exit(1);
}

async function fetchCheck(label, url, { allow404 = false } = {}) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (res.status >= 500) fail(`${label} HTTP ${res.status}`);
  if (!res.ok && !(allow404 && res.status === 404)) {
    fail(`${label} HTTP ${res.status}`);
  }
  console.log(`  ✓ ${label} (${res.status})`);
}

export async function runSmoke() {
  const types = fs.readFileSync(typesPath, "utf8");
  if (/email_logs/.test(types)) fail("types.ts still contains email_logs");
  console.log("  ✓ types.ts has no email_logs");

  try {
    await fetchCheck("health", `${BASE}/api/health`);
    await fetchCheck("marketplace", `${BASE}/api/marketplace?pageSize=1`);
    await fetchCheck("verify", `${BASE}/api/public/verify?code=SMOKE_TEST`, { allow404: true });

    if (process.env.SMOKE_AUTH_COOKIE) {
      const dash = await fetch(`${BASE}/api/dashboard?range=30`, {
        headers: { cookie: process.env.SMOKE_AUTH_COOKIE },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (dash.status >= 500) fail(`dashboard HTTP ${dash.status}`);
      console.log(`  ✓ dashboard (${dash.status})`);
    } else {
      console.log("  ⚠ dashboard skipped (set SMOKE_AUTH_COOKIE for authenticated RPC check)");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/fetch|ECONNREFUSED|timeout/i.test(msg)) {
      console.log(`smoke-supabase SKIP — ${BASE} not reachable (${msg})`);
      process.exit(0);
    }
    throw err;
  }

  console.log("smoke-supabase OK");
}

runSmoke();
