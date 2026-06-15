#!/usr/bin/env node
/**
 * Phase 11 — report .next/static/chunks/*.js sizes.
 * --write-baseline: save JSON next to phase planning dir
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CHUNKS_DIR = join(ROOT, ".next", "static", "chunks");
const WRITE_BASELINE = process.argv.includes("--write-baseline");
const BASELINE_PATH = join(
  ROOT,
  ".planning/phases/11-javascript-bundle-performance-baseline-audit-tree-shakeable-/11-baseline-chunks.json"
);

function scanChunks() {
  if (!existsSync(CHUNKS_DIR)) {
    console.error("phase11:bundle-report — .next/static/chunks not found. Run npm run build first.");
    process.exit(1);
  }

  const files = readdirSync(CHUNKS_DIR)
    .filter((name) => name.endsWith(".js"))
    .map((name) => {
      const path = join(CHUNKS_DIR, name);
      const bytes = statSync(path).size;
      return { name, bytes, kb: Math.round((bytes / 1024) * 10) / 10 };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const totalBytes = files.reduce((sum, f) => sum + f.bytes, 0);
  const totalKb = Math.round((totalBytes / 1024) * 10) / 10;

  return { generatedAt: new Date().toISOString(), totalBytes, totalKb, files };
}

const report = scanChunks();

if (WRITE_BASELINE) {
  writeFileSync(BASELINE_PATH, JSON.stringify(report, null, 2));
  console.log(`phase11:bundle-baseline — wrote ${BASELINE_PATH} (${report.totalKb} KB total)`);
} else {
  console.log(`Total JS chunks: ${report.totalKb} KB (${report.files.length} files)\n`);
  console.log("Top chunks:");
  for (const file of report.files.slice(0, 15)) {
    console.log(`  ${String(file.kb).padStart(8)} KB  ${file.name}`);
  }
}
