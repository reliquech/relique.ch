#!/usr/bin/env node
/**
 * Phase 8 DB audit — map Supabase tables, RPCs, and storage buckets
 * against src/ call sites and migration definitions.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const MIGRATIONS = path.join(ROOT, "supabase", "migrations");
const OUTPUT = path.join(ROOT, "supabase", "SUPABASE_USAGE.md");
const SKIP_DIRS = new Set(["node_modules", ".next", "graphify-out"]);

/** Locked verdicts (Phase 8 CONTEXT / 08-01) */
const LOCKED = {
  tables: {
    email_logs: { verdict: "PRUNE", note: "Resend removed — locked D-08-01" },
  },
  functions: {
    admin_upsert_profile: { verdict: "PRUNE", note: "unused RPC — locked D-08-02" },
    crm_dashboard_summary: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_activity_series: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_funnel_summary: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_lead_source_performance: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_deal_aging: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_stage_velocity: { verdict: "KEEP", note: "dashboard RPC — locked" },
    crm_funnel_by_source: { verdict: "KEEP", note: "dashboard RPC — locked" },
    handle_updated_at: { verdict: "MERGE_IN_BASELINE", note: "trigger-only; consolidate in baseline" },
    handle_new_user: { verdict: "MERGE_IN_BASELINE", note: "trigger-only; consolidate in baseline" },
    log_audit_event: { verdict: "MERGE_IN_BASELINE", note: "trigger-only" },
    set_marketplace_state_timestamps: { verdict: "MERGE_IN_BASELINE", note: "trigger-only" },
  },
  buckets: {
    "marketplace-images": { verdict: "KEEP", note: "locked — marketplace upload" },
    "crm-attachments": { verdict: "KEEP", note: "locked — CRM attachments" },
    "consign-submissions": { verdict: "KEEP", note: "locked — public consign upload" },
  },
};

const TRIGGER_ONLY = new Set([
  "handle_updated_at",
  "handle_new_user",
  "log_audit_event",
  "set_marketplace_state_timestamps",
]);

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function addRef(map, key, file, line) {
  if (!map.has(key)) map.set(key, []);
  const entry = `${rel(file)}:${line}`;
  const list = map.get(key);
  if (!list.includes(entry)) list.push(entry);
}

function scanSrc() {
  const tableRefs = new Map();
  const rpcRefs = new Map();
  const bucketRefs = new Map();

  const fromRe = /\.from\s*\(\s*["']([a-z_][a-z0-9_-]*)["']\s*\)/gi;
  const rpcRe = /\.rpc\s*\(\s*["']([a-z_][a-z0-9_]*)["']/gi;
  const storageFromRe = /storage\.from\s*\(\s*["']([a-z0-9-]+)["']\s*\)/gi;
  const callRpcRe = /callRpc\s*\(\s*["']([a-z_][a-z0-9_]*)["']/gi;

  for (const file of walk(SRC)) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      if (/storage\.from/.test(line)) {
        let m;
        storageFromRe.lastIndex = 0;
        while ((m = storageFromRe.exec(line)) !== null) {
          addRef(bucketRefs, m[1], file, lineNo);
        }
      }

      let m;
      fromRe.lastIndex = 0;
      while ((m = fromRe.exec(line)) !== null) {
        const name = m[1];
        if (name === "length" || name === "values") continue;
        if (/storage\.from/.test(line) && LOCKED.buckets[name]) {
          addRef(bucketRefs, name, file, lineNo);
        } else if (!/storage\.from/.test(line)) {
          addRef(tableRefs, name, file, lineNo);
        }
      }

      rpcRe.lastIndex = 0;
      while ((m = rpcRe.exec(line)) !== null) {
        addRef(rpcRefs, m[1], file, lineNo);
      }

      callRpcRe.lastIndex = 0;
      while ((m = callRpcRe.exec(line)) !== null) {
        addRef(rpcRefs, m[1], file, lineNo);
      }
    });
  }

  return { tableRefs, rpcRefs, bucketRefs };
}

function scanMigrations() {
  const tables = new Map();
  const functions = new Map();
  const buckets = new Map();

  const sqlFiles = fs
    .readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    const content = fs.readFileSync(path.join(MIGRATIONS, file), "utf8");

    const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)/gi;
    let m;
    while ((m = tableRe.exec(content)) !== null) {
      const name = m[1];
      if (!tables.has(name)) tables.set(name, []);
      tables.get(name).push(file);
    }

    const fnRe =
      /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/gi;
    while ((m = fnRe.exec(content)) !== null) {
      const name = m[1];
      if (!functions.has(name)) functions.set(name, []);
      functions.get(name).push(file);
    }

    const bucketRe = /insert\s+into\s+storage\.buckets[^;]*['"]([a-z0-9-]+)['"]/gi;
    while ((m = bucketRe.exec(content)) !== null) {
      const name = m[1];
      if (!buckets.has(name)) buckets.set(name, []);
      buckets.get(name).push(file);
    }

    const bucketIdRe = /bucket_id\s*=\s*['"]([a-z0-9-]+)['"]/gi;
    while ((m = bucketIdRe.exec(content)) !== null) {
      const name = m[1];
      if (!buckets.has(name)) buckets.set(name, []);
      if (!buckets.get(name).includes(file)) buckets.get(name).push(file);
    }
  }

  return { tables, functions, buckets, sqlFiles };
}

function verdictTable(name, refs) {
  if (LOCKED.tables[name]) return LOCKED.tables[name];
  if (refs.length > 0) return { verdict: "KEEP", note: `${refs.length} app ref(s)` };
  return { verdict: "KEEP", note: "schema-only / infra — verify before prune" };
}

function verdictFunction(name, refs) {
  if (LOCKED.functions[name]) return LOCKED.functions[name];
  if (TRIGGER_ONLY.has(name)) {
    return { verdict: "MERGE_IN_BASELINE", note: "trigger-only" };
  }
  if (refs.length > 0) return { verdict: "KEEP", note: `${refs.length} app ref(s)` };
  return { verdict: "KEEP", note: "defined in migrations; no direct app .rpc()" };
}

function verdictBucket(name, refs) {
  if (LOCKED.buckets[name]) return LOCKED.buckets[name];
  if (refs.length > 0) return { verdict: "KEEP", note: `${refs.length} app ref(s)` };
  return { verdict: "KEEP", note: "migration-defined bucket" };
}

function formatTable(rows) {
  const header = "| Object | Migrations | App refs | Verdict | Notes |\n|--------|------------|----------|---------|-------|\n";
  const body = rows
    .map(([name, migrations, refs, v]) => {
      const refStr = refs.length ? refs.join(", ") : "0 refs";
      const migStr = migrations.length ? migrations.join(", ") : "—";
      return `| \`${name}\` | ${migStr} | ${refStr} | **${v.verdict}** | ${v.note} |`;
    })
    .join("\n");
  return header + body;
}

export function runAudit() {
  const { tableRefs, rpcRefs, bucketRefs } = scanSrc();
  const { tables, functions, buckets } = scanMigrations();

  const allTableNames = new Set([...tables.keys(), ...tableRefs.keys()]);
  const allFnNames = new Set([...functions.keys(), ...rpcRefs.keys()]);
  const allBucketNames = new Set([...buckets.keys(), ...bucketRefs.keys()]);

  const tableRows = [...allTableNames].sort().map((name) => {
    const migrations = tables.get(name) ?? [];
    const refs = tableRefs.get(name) ?? [];
    const v = verdictTable(name, refs);
    return [name, migrations, refs, v];
  });

  const fnRows = [...allFnNames].sort().map((name) => {
    const migrations = functions.get(name) ?? [];
    const refs = rpcRefs.get(name) ?? [];
    const v = verdictFunction(name, refs);
    return [name, migrations, refs, v];
  });

  const bucketRows = [...allBucketNames].sort().map((name) => {
    const migrations = buckets.get(name) ?? [];
    const refs = bucketRefs.get(name) ?? [];
    const v = verdictBucket(name, refs);
    return [name, migrations, refs, v];
  });

  const evidenceFiles = [...walk(SRC)]
    .filter((f) => {
      const c = fs.readFileSync(f, "utf8");
      return /\.from\s*\(|\.rpc\s*\(|storage\.from/.test(c);
    })
    .map(rel)
    .sort();

  const report = {
    generatedAt: new Date().toISOString(),
    tables: tableRows.map(([n, m, r, v]) => ({
      name: n,
      migrations: m,
      refs: r,
      verdict: v.verdict,
      note: v.note,
    })),
    functions: fnRows.map(([n, m, r, v]) => ({
      name: n,
      migrations: m,
      refs: r,
      verdict: v.verdict,
      note: v.note,
    })),
    buckets: bucketRows.map(([n, m, r, v]) => ({
      name: n,
      migrations: m,
      refs: r,
      verdict: v.verdict,
      note: v.note,
    })),
    evidenceFiles,
  };

  const md = `# Supabase Usage Inventory

**Generated:** ${report.generatedAt}  
**Script:** \`node scripts/audit-supabase-usage.mjs\`  
**Purpose:** Authoritative KEEP/PRUNE map for Phase 8 prune + baseline.

## Tables

${formatTable(tableRows)}

## RPC / Functions

${formatTable(fnRows)}

## Storage Buckets

${formatTable(bucketRows)}

## Schema objects not queried by app

Objects below exist only in migrations (policies, indexes, triggers) or as trigger-only functions — **infra only**, no direct \`.from()\` / \`.rpc()\` in \`src/\`.

| Object | Type | Note |
|--------|------|------|
| RLS policies | policy | Defined across 005, 009, per-table migrations — see RLS_AUDIT.md (08-03) |
| Indexes | index | 006, 032, 035 and per-table indexes — see INDEX_AUDIT.md (08-03) |
| Triggers | trigger | 007 + per-table — invoke MERGE_IN_BASELINE functions |
| \`handle_updated_at\` | function | Trigger-only — MERGE_IN_BASELINE |
| \`handle_new_user\` | function | Trigger-only — MERGE_IN_BASELINE |
| \`log_audit_event\` | function | Trigger-only |
| \`set_marketplace_state_timestamps\` | function | Trigger-only |

## Overlap registry

| Area | Files | Resolution |
|------|-------|------------|
| RLS | 005 + 009 | 009 patches performance; effective policies = both applied; baseline merges per RLS_AUDIT |
| RPC chain | 014 → 020 → 025 | Final bodies from 025 (includes 014+020 extensions) |
| Profiles DDL | 001 + 015 + 030 | 030 table recreate redundant on DBs with 001–015 applied; keep trigger helpers from 030 |

## Prune queue (migration 036)

| Object | Action | SQL preview |
|--------|--------|-------------|
| \`email_logs\` | DROP TABLE CASCADE | \`drop table if exists public.email_logs cascade;\` |
| \`admin_upsert_profile\` | DROP FUNCTION | \`drop function if exists public.admin_upsert_profile(uuid, text, text, text);\` |

**Do NOT drop:** \`handle_updated_at\`, \`handle_new_user\`, 7 dashboard CRM RPCs, storage buckets.

## Evidence index

All \`src/\` files touching Supabase (${evidenceFiles.length} files):

${evidenceFiles.map((f) => `- \`${f}\``).join("\n")}

## Locked decisions

- **PRUNE** \`email_logs\` — Resend removed from v1 (D-08-01)
- **PRUNE** \`admin_upsert_profile\` — users API uses \`.upsert()\` directly (D-08-02)
- **KEEP** 7 dashboard RPCs — \`src/app/api/dashboard/route.ts\`
- **KEEP** 3 buckets — \`marketplace-images\`, \`crm-attachments\`, \`consign-submissions\`
`;

  fs.writeFileSync(OUTPUT, md, "utf8");
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("audit-supabase-usage.mjs")) {
  runAudit();
  console.error(`Wrote ${rel(OUTPUT)}`);
}
