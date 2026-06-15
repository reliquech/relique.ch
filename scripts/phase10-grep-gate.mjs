#!/usr/bin/env node
/**
 * Phase 10 — forbid @/admin/ imports after restructure.
 * --baseline: print counts (pre/post compare)
 * default: exit 1 if any pattern matches in src/
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const ADMIN_DIR = join(SRC, "admin");
const BASELINE = process.argv.includes("--baseline");

const PATTERNS = ["@/admin/", 'from "@/admin/', "from '@/admin/"];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(path, files);
    } else if (/\.(ts|tsx)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

const files = walk(SRC);
const counts = Object.fromEntries(PATTERNS.map((p) => [p, 0]));
const hits = Object.fromEntries(PATTERNS.map((p) => [p, []]));

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  for (const pattern of PATTERNS) {
    if (text.includes(pattern)) {
      counts[pattern] += 1;
      if (!BASELINE && hits[pattern].length < 8) {
        hits[pattern].push(rel);
      }
    }
  }
}

if (BASELINE) {
  console.log("Phase 10 grep baseline (files containing pattern):");
  for (const pattern of PATTERNS) {
    console.log(`  ${pattern}: ${counts[pattern]}`);
  }
  console.log(`  src/admin/ exists: ${existsSync(ADMIN_DIR)}`);
  process.exit(0);
}

let total = 0;
for (const pattern of PATTERNS) {
  if (counts[pattern] > 0) {
    total += counts[pattern];
    console.error(`FAIL ${pattern}: ${counts[pattern]} file(s)`);
    for (const f of hits[pattern]) {
      console.error(`  - ${f}`);
    }
  }
}

if (existsSync(ADMIN_DIR)) {
  console.error("FAIL src/admin/ directory still exists");
  process.exit(1);
}

if (total > 0) {
  console.error(`\nphase10:grep-gate — ${total} forbidden ref(s) in src/`);
  process.exit(1);
}

console.log("phase10:grep-gate — PASS (0 @/admin/ refs, no src/admin/)");
process.exit(0);
