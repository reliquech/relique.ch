#!/usr/bin/env node
/**
 * Phase 11 — compare current .next chunks to baseline JSON.
 * Exits 1 if total KB increased by more than 5% vs baseline.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BASELINE_PATH = join(
  ROOT,
  ".planning/phases/11-javascript-bundle-performance-baseline-audit-tree-shakeable-/11-baseline-chunks.json"
);

if (!existsSync(BASELINE_PATH)) {
  console.error("phase11:bundle-compare — baseline missing. Run npm run phase11:bundle-baseline after first build.");
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));

let currentRaw;
try {
  currentRaw = execSync("node scripts/phase11-bundle-report.mjs", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch {
  console.error("phase11:bundle-compare — failed to read current chunks. Run npm run build first.");
  process.exit(1);
}

// Re-scan directly for accurate numbers
import { readdirSync, statSync } from "node:fs";
const CHUNKS_DIR = join(ROOT, ".next", "static", "chunks");
const currentBytes = readdirSync(CHUNKS_DIR)
  .filter((name) => name.endsWith(".js"))
  .reduce((sum, name) => sum + statSync(join(CHUNKS_DIR, name)).size, 0);
const currentKb = Math.round((currentBytes / 1024) * 10) / 10;
const baselineKb = baseline.totalKb;
const deltaKb = Math.round((currentKb - baselineKb) * 10) / 10;
const deltaPct = baselineKb > 0 ? Math.round(((currentKb - baselineKb) / baselineKb) * 1000) / 10 : 0;

console.log("phase11:bundle-compare");
console.log(`  Baseline: ${baselineKb} KB`);
console.log(`  Current:  ${currentKb} KB`);
console.log(`  Delta:    ${deltaKb >= 0 ? "+" : ""}${deltaKb} KB (${deltaPct >= 0 ? "+" : ""}${deltaPct}%)`);

if (deltaPct > 5) {
  console.error(`phase11:bundle-compare — FAIL: bundle grew ${deltaPct}% (>5% regression threshold)`);
  process.exit(1);
}

console.log("phase11:bundle-compare — PASS");
process.exit(0);
