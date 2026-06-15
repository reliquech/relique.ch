#!/usr/bin/env node
/**
 * Optional HTTP smoke for Phase 2 public routes. Skips gracefully if dev server down.
 */
const BASE = process.env.PHASE2_SMOKE_BASE ?? "http://localhost:1300";
const VERIFY_CODE = process.env.PHASE2_VERIFY_CODE ?? "RLQ-TEST-0001";

const MIN_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function reachable(url) {
  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(3000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  const health = await reachable(`${BASE}/api/health`);
  if (!health) {
    console.log(`phase2:smoke SKIP — ${BASE} not reachable (start npm run dev)`);
    process.exit(0);
  }

  const failures = [];

  const verifyKnown = await fetch(`${BASE}/api/public/verify?code=${encodeURIComponent(VERIFY_CODE)}`);
  if (!verifyKnown.ok) failures.push(`verify known: HTTP ${verifyKnown.status}`);

  const verifyUnknown = await fetch(`${BASE}/api/public/verify?code=UNKNOWN-CODE-999`);
  if (!verifyUnknown.ok) failures.push(`verify unknown: HTTP ${verifyUnknown.status}`);
  else {
    const body = await verifyUnknown.json();
    if (body.found !== false) failures.push("verify unknown: expected found:false");
  }

  const contact = await fetch(`${BASE}/api/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      email: "smoke@example.com",
      message: "Phase 2 automated smoke test message.",
    }),
  });
  if (contact.status >= 500) failures.push(`contact: HTTP ${contact.status}`);

  const form = new FormData();
  form.append("contact_name", "Smoke Consign");
  form.append("contact_email", "smoke-consign@example.com");
  form.append("item_description", "Phase 2 smoke consign item description.");
  form.append(
    "photos",
    new Blob([MIN_PNG], { type: "image/png" }),
    "smoke.png"
  );

  const consign = await fetch(`${BASE}/api/public/consign`, { method: "POST", body: form });
  if (consign.status >= 500) failures.push(`consign: HTTP ${consign.status}`);

  if (failures.length) {
    console.error("phase2:smoke FAILED:");
    failures.forEach((f) => console.error(`  ${f}`));
    process.exit(1);
  }

  console.log("phase2:smoke OK");
}

main().catch((err) => {
  console.error("phase2:smoke error:", err);
  process.exit(1);
});
