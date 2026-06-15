#!/usr/bin/env node
/**
 * Phase 10 — move src/admin/** to components/admin + features, then rewrite imports.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const MOVES = [
  ["admin/users/services", "features/users/services"],
  ["admin/users/hooks", "features/users/hooks"],
  ["admin/users/types.ts", "features/users/types.ts"],
  ["admin/users/pages", "components/admin/users/pages"],
  ["admin/notifications/components", "components/admin/notifications/components"],
  ["admin/notifications/services", "features/notifications/services"],
  ["admin/notifications/types.ts", "features/notifications/types.ts"],
  ["admin/dashboard/pages", "components/admin/dashboard/pages"],
  ["admin/dashboard/components", "components/admin/dashboard/components"],
  ["admin/dashboard/services", "features/dashboard/services"],
  ["admin/dashboard/types.ts", "features/dashboard/types.ts"],
  ["admin/submissions/pages", "components/admin/submissions/pages"],
  ["admin/submissions/components", "components/admin/submissions/components"],
  ["admin/submissions/services", "features/submissions/services"],
  ["admin/submissions/types.ts", "features/submissions/types.ts"],
  ["admin/marketplace/pages", "components/admin/marketplace/pages"],
  ["admin/marketplace/components", "components/admin/marketplace"],
  ["admin/marketplace/hooks", "features/marketplace/hooks"],
  ["admin/marketplace/services", "features/marketplace/services"],
  ["admin/marketplace/schema.ts", "features/marketplace/schema.ts"],
  ["admin/marketplace/types.ts", "features/marketplace/types.ts"],
  ["admin/crm/pages", "components/admin/crm/pages"],
  ["admin/crm/components", "components/admin/crm/components"],
  ["admin/crm/services", "features/crm/services"],
  ["admin/crm/hooks", "features/crm/hooks"],
  ["admin/crm/schemas.ts", "features/crm/schemas.ts"],
];

const DELETE_PATHS = [
  "admin/marketplace/constants.ts",
  "admin/marketplace/utils/uploadPaths.ts",
  "admin/crm/types.ts",
  "admin/users/index.ts",
  "admin/notifications/index.ts",
  "admin/dashboard/index.ts",
  "admin/submissions/index.ts",
  "admin/marketplace/index.ts",
  "admin/crm/index.ts",
];

const IMPORT_REPLACEMENTS = [
  ["@/admin/users/hooks/", "@/features/users/hooks/"],
  ["@/admin/users/services/", "@/features/users/services/"],
  ["@/admin/users/types", "@/features/users/types"],
  ["@/admin/users/pages/", "@/components/admin/users/pages/"],
  ["@/admin/notifications/components/", "@/components/admin/notifications/components/"],
  ["@/admin/notifications/services/", "@/features/notifications/services/"],
  ["@/admin/notifications/types", "@/features/notifications/types"],
  ["@/admin/dashboard/pages/", "@/components/admin/dashboard/pages/"],
  ["@/admin/dashboard/components/", "@/components/admin/dashboard/components/"],
  ["@/admin/dashboard/services/", "@/features/dashboard/services/"],
  ["@/admin/dashboard/types", "@/features/dashboard/types"],
  ["@/admin/submissions/pages/", "@/components/admin/submissions/pages/"],
  ["@/admin/submissions/components/", "@/components/admin/submissions/components/"],
  ["@/admin/submissions/services/", "@/features/submissions/services/"],
  ["@/admin/submissions/types", "@/features/submissions/types"],
  ["@/admin/marketplace/pages/", "@/components/admin/marketplace/pages/"],
  ["@/admin/marketplace/components/", "@/components/admin/marketplace/"],
  ["@/admin/marketplace/hooks/", "@/features/marketplace/hooks/"],
  ["@/admin/marketplace/services/", "@/features/marketplace/services/"],
  ["@/admin/marketplace/schema", "@/features/marketplace/schema"],
  ["@/admin/marketplace/constants", "@/features/marketplace/constants"],
  ["@/admin/marketplace/utils/uploadPaths", "@/features/marketplace/utils/uploadPaths"],
  ["@/admin/marketplace/types", "@/features/marketplace/types"],
  ["@/admin/crm/pages/", "@/components/admin/crm/pages/"],
  ["@/admin/crm/components/", "@/components/admin/crm/components/"],
  ["@/admin/crm/services/", "@/features/crm/services/"],
  ["@/admin/crm/hooks/", "@/features/crm/hooks/"],
  ["@/admin/crm/schemas", "@/features/crm/schemas"],
  ["@/admin/crm/types", "@/features/crm/types"],
  ["@/components/admin/marketplace-form/", "@/components/admin/marketplace/form/"],
  ["@/components/shared/CrmViewBar", "@/components/admin/crm/CrmViewBar"],
  ["@/components/admin/PortalSidebar", "@/components/admin/shell/PortalSidebar"],
  ["@/components/admin/AdminPortalLayout", "@/components/admin/shell/AdminPortalLayout"],
];

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function movePath(fromRel, toRel) {
  const from = join(SRC, fromRel);
  const to = join(SRC, toRel);
  if (!existsSync(from)) {
    console.warn(`skip missing: ${fromRel}`);
    return;
  }
  const fromStat = statSync(from);
  if (fromStat.isDirectory() && existsSync(to) && statSync(to).isDirectory()) {
    for (const name of readdirSync(from)) {
      movePath(join(fromRel, name).replace(/\\/g, "/"), join(toRel, name).replace(/\\/g, "/"));
    }
    removeEmpty(from);
    return;
  }
  if (existsSync(to)) {
    console.warn(`skip exists: ${toRel}`);
    return;
  }
  ensureDir(dirname(to));
  renameSync(from, to);
  console.log(`moved ${fromRel} -> ${toRel}`);
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(path, files);
    } else if (/\.(ts|tsx|js|jsx|md)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

ensureDir(join(SRC, "components/admin/shell"));
if (existsSync(join(SRC, "components/admin/PortalSidebar.tsx"))) {
  rmSync(join(SRC, "components/admin/PortalSidebar.tsx"), { force: true });
  console.log("deleted duplicate components/admin/PortalSidebar.tsx");
}
if (existsSync(join(SRC, "components/admin/AdminPortalLayout.tsx"))) {
  rmSync(join(SRC, "components/admin/AdminPortalLayout.tsx"), { force: true });
  console.log("deleted duplicate components/admin/AdminPortalLayout.tsx");
}
if (existsSync(join(SRC, "components/shared/CrmViewBar.tsx"))) {
  ensureDir(join(SRC, "components/admin/crm"));
  movePath("components/shared/CrmViewBar.tsx", "components/admin/crm/CrmViewBar.tsx");
}
if (existsSync(join(SRC, "components/admin/marketplace-form"))) {
  movePath("components/admin/marketplace-form", "components/admin/marketplace/form-tmp");
  if (existsSync(join(SRC, "components/admin/marketplace/form-tmp"))) {
    for (const name of readdirSync(join(SRC, "components/admin/marketplace/form-tmp"))) {
      const dest = join(SRC, "components/admin/marketplace/form", name);
      if (!existsSync(dest)) {
        ensureDir(join(SRC, "components/admin/marketplace/form"));
        renameSync(join(SRC, "components/admin/marketplace/form-tmp", name), dest);
      }
    }
    removeEmpty(join(SRC, "components/admin/marketplace/form-tmp"));
  }
}

for (const [from, to] of MOVES) {
  movePath(from, to);
}

for (const rel of DELETE_PATHS) {
  const p = join(SRC, rel);
  if (existsSync(p)) {
    rmSync(p, { force: true });
    console.log(`deleted ${rel}`);
  }
}

let changed = 0;
for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of IMPORT_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    writeFileSync(file, next, "utf8");
    changed++;
  }
}

function removeEmpty(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) removeEmpty(p);
  }
  if (existsSync(dir) && readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: true });
    console.log(`removed empty ${relative(ROOT, dir)}`);
  }
}
removeEmpty(join(SRC, "admin"));

console.log(`import rewrites: ${changed} files`);
console.log("phase10-migrate done");
