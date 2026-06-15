#!/usr/bin/env node
/**
 * Phase 2 regression gate: no Resend/transactional email code in src/.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const SKIP_DIRS = new Set(["node_modules", ".next", "graphify-out"]);

const patterns = [
  /resend/i,
  /sendTransactional/,
  /RESEND_/,
  /OPERATOR_EMAIL/,
  /api\.resend\.com/,
  /lib\/email\//,
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];

for (const file of walk(SRC)) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of patterns) {
      if (re.test(line)) {
        violations.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    }
  });
}

if (violations.length > 0) {
  console.error("phase2:no-email-gate FAILED — email patterns in src/:");
  violations.forEach((v) => console.error(`  ${v}`));
  process.exit(1);
}

console.log("phase2:no-email-gate OK — no email patterns in src/");
process.exit(0);
