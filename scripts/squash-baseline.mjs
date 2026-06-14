#!/usr/bin/env node
/**
 * Generate 000_baseline.sql from incremental chain 001-035 (post-036 prune state).
 * Excludes email_logs (017, 034) and admin_upsert_profile (stripped from 030).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS = path.join(ROOT, "supabase", "migrations");
const LEGACY = path.join(MIGRATIONS, "legacy");
const OUT = path.join(MIGRATIONS, "000_baseline.sql");

const SKIP_FILES = new Set([
  "017_create_email_logs.sql",
  "034_email_logs_nullable_user_id.sql",
]);

const HEADER = `-- Relique.co baseline schema (squashed 001-035, post-036 prune state)
-- FRESH INSTALLS ONLY — run this single file OR use legacy incremental chain
-- Generated: Phase 8 — do not apply on brownfield DBs with 001+ already applied
-- Excludes: email_logs, admin_upsert_profile (see 036_prune_dead_schema.sql for brownfield)
`;

function stripAdminUpsertProfile(sql) {
  const start = /-- Optional helper for admins to upsert profile/i;
  const idx = sql.search(start);
  if (idx === -1) return sql;
  return sql.slice(0, idx).trimEnd() + "\n";
}

function squash() {
  const sourceDir = fs.existsSync(LEGACY) ? LEGACY : MIGRATIONS;
  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => /^0(0[1-9]|[1-2][0-9]|3[0-5])_/.test(f) && f.endsWith(".sql"))
    .sort();

  const parts = [HEADER, ""];

  for (const file of files) {
    if (SKIP_FILES.has(file)) continue;
    let content = fs.readFileSync(path.join(sourceDir, file), "utf8");
    if (file === "030_admin_create_account_function.sql") {
      content = stripAdminUpsertProfile(content);
    }
    parts.push(`-- ========== ${file} ==========`);
    parts.push(content.trim());
    parts.push("");
  }

  const baseline = parts.join("\n");
  fs.writeFileSync(OUT, baseline, "utf8");
  return { files: files.length - SKIP_FILES.size, lines: baseline.split("\n").length };
}

const result = squash();
console.log(`Wrote ${OUT} (${result.files} migration sections, ${result.lines} lines)`);
