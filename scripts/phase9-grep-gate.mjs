#!/usr/bin/env node
/**
 * Phase 9 — forbidden-pattern gate for removed CRM modules.
 * --baseline: print counts (pre/post removal compare)
 * default: exit 1 if any pattern matches in src/
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const BASELINE = process.argv.includes("--baseline");

const PATTERNS = [
  "/api/tasks",
  "admin/tasks",
  "TasksWidget",
  "tasksService",
  "/api/alert-rules",
  "admin/automations",
  "AlertScheduler",
  "alertRulesService",
  "/api/pipeline-stages",
  "PipelineStagesPage",
  "pipelineStagesService",
  "DealsBoard",
  "/api/custom-fields",
  "custom-field-values",
  "CustomFieldsSection",
  "customFieldsService",
  "customFieldValuesService",
];

function walk(dir, files = []) {
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
      if (!BASELINE && hits[pattern].length < 5) {
        hits[pattern].push(rel);
      }
    }
  }
}

if (BASELINE) {
  console.log("Phase 9 grep baseline (files containing pattern):");
  for (const pattern of PATTERNS) {
    console.log(`  ${pattern}: ${counts[pattern]}`);
  }
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

if (total > 0) {
  console.error(`\nphase9:grep-gate — ${total} forbidden ref(s) in src/`);
  process.exit(1);
}

console.log("phase9:grep-gate — PASS (0 forbidden refs)");
process.exit(0);
