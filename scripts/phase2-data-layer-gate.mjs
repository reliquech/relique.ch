#!/usr/bin/env node
/**
 * Phase 2 DATA-04 gate: public paths must not import local verify/consign adapters.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const SKIP_DIRS = new Set(["node_modules", ".next", "graphify-out"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

for (const file of walk(SRC)) {
  const r = rel(file);
  if (r.startsWith("src/lib/legacy/")) continue;

  const content = fs.readFileSync(file, "utf8");
  if (/verify\.local|consign\.local/.test(content)) {
    violations.push(`${r}: imports verify.local or consign.local outside legacy/`);
  }
  if (
    /@\/lib\/domain\/storage\/verify|@\/lib\/domain\/storage\/consign|lib\/domain\/storage\/verify|lib\/domain\/storage\/consign/.test(
      content
    )
  ) {
    violations.push(`${r}: imports domain/storage verify or consign outside legacy/`);
  }
  if (r.includes("ConsignForm") && /@\/lib\/legacy/.test(content)) {
    violations.push(`${r}: ConsignForm must not import legacy`);
  }
  if (r.includes("verify/page") && /@\/lib\/legacy/.test(content)) {
    violations.push(`${r}: verify page must not import legacy`);
  }
}

const implIndex = path.join(SRC, "lib", "services", "impl", "index.ts");
const implContent = fs.readFileSync(implIndex, "utf8");
if (!implContent.includes("verifyServiceSupabase") || !implContent.includes("consignServiceSupabase")) {
  violations.push("src/lib/services/impl/index.ts: must export verifyServiceSupabase and consignServiceSupabase");
}

if (violations.length > 0) {
  console.error("phase2:data-layer-gate FAILED:");
  violations.forEach((v) => console.error(`  ${v}`));
  process.exit(1);
}

console.log("phase2:data-layer-gate OK");
process.exit(0);
