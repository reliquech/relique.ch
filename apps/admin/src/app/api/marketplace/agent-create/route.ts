import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import { promises as fs } from "fs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PROMPT_DIR_NAME = "prompt for images generated";
const OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images";

const AgentCreatePayloadSchema = z
  .object({
    entity_type: z.string().optional(),
    id: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    state: z
      .object({
        lifecycle: z.enum(["draft", "published", "archived"]).optional(),
        visibility: z.enum(["private", "unlisted", "public"]).optional(),
        featured: z
          .object({
            is: z.boolean().optional(),
            order: z.number().optional().nullable(),
          })
          .optional(),
        publish_at: z.string().optional().nullable(),
        created_at: z.string().optional().nullable(),
        updated_at: z.string().optional().nullable(),
        created_by: z.string().optional().nullable(),
      })
      .optional(),
    listing: z.object({
      title: z.string().min(1),
      subtitle: z.string().optional().nullable(),
      short: z.string().min(1),
      price: z.object({
        amount: z.number(),
        currency: z.string().min(3).max(3).optional().default("USD"),
        compare_at: z.number().optional().nullable(),
      }),
      category: z.string().min(1),
      tags: z.array(z.string()).optional().default([]),
    }),
    signing: z
      .object({
        type: z.string().optional().nullable(),
        signers: z.array(z.string()).optional().default([]),
        count: z.number().optional().nullable(),
        ink: z
          .object({
            id: z.string().optional().nullable(),
            custom: z.string().optional().nullable(),
          })
          .optional(),
        placement: z
          .object({
            id: z.string().optional().nullable(),
            custom: z.string().optional().nullable(),
          })
          .optional(),
        inscription_text: z.string().optional().nullable(),
        sig_condition: z.string().optional().nullable(),
      })
      .optional(),
    condition: z
      .object({
        grade: z.string().optional().nullable(),
        wear: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      })
      .optional(),
    auth: z
      .object({
        status: z.string().optional().nullable(),
        provider_id: z.string().optional().nullable(),
        coa_refs: z.array(z.string()).optional().default([]),
      })
      .optional(),
    jersey: z.unknown().optional().nullable(),
    refs: z
      .object({
        content_id: z.string().optional().nullable(),
        media_album_id: z.string().optional().nullable(),
        proof_bundle_id: z.string().optional().nullable(),
      })
      .optional(),
    media: z
      .object({
        hero_id: z.string().optional().nullable(),
      })
      .optional(),
  })
  .passthrough();

type PromptConfig = {
  name: string;
  model: string;
  size: string;
  n?: number;
  quality?: string;
  background?: string;
  input_fidelity?: string;
  referenced_image_ids?: string[];
  prompt: string;
};

type ReferenceInputKey =
  | "backSignature"
  | "backSignatureClose"
  | "frontLogos"
  | "frontCrestClose"
  | "productCleanShot";

type ReferenceInputs = Record<ReferenceInputKey, File | null>;

type ReferenceMapping = {
  key: ReferenceInputKey;
  required: boolean;
  label: string;
};

const REFERENCE_INPUTS: Record<string, ReferenceMapping> = {
  ID_BACK_NAME_NUMBER_SIGNATURE: {
    key: "backSignature",
    required: true,
    label: "Back name/number signature",
  },
  ID_BACK_NAME_NUMBER_SIGNATURE_OPTIONAL: {
    key: "backSignature",
    required: false,
    label: "Back name/number signature",
  },
  ID_BACK_NAME_NUMBER_SIGNATURE_CLOSE: {
    key: "backSignatureClose",
    required: true,
    label: "Back signature close-up",
  },
  ID_FRONT_LOGOS: {
    key: "frontLogos",
    required: true,
    label: "Front logos/sponsor",
  },
  ID_FRONT_LOGOS_SPONSOR: {
    key: "frontLogos",
    required: true,
    label: "Front logos/sponsor",
  },
  ID_FRONT_CREST_CLOSE: {
    key: "frontCrestClose",
    required: true,
    label: "Front crest close-up",
  },
  ID_PRODUCT_CLEAN_SHOT: {
    key: "productCleanShot",
    required: false,
    label: "Product clean shot",
  },
  ID_PRODUCT_CLEAN_SHOT_OPTIONAL: {
    key: "productCleanShot",
    required: false,
    label: "Product clean shot",
  },
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function sanitizeNullable(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function resolvePromptDir() {
  const candidateRoots = [
    path.resolve(process.cwd(), "docs", PROMPT_DIR_NAME),
    path.resolve(process.cwd(), "..", "docs", PROMPT_DIR_NAME),
    path.resolve(process.cwd(), "..", "..", "docs", PROMPT_DIR_NAME),
  ];

  for (const candidate of candidateRoots) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Prompt directory not found.");
}

async function loadPromptConfigs() {
  const promptDir = await resolvePromptDir();
  const entries = await fs.readdir(promptDir);
  const promptFiles = entries
    .filter((entry) => entry.toLowerCase().startsWith("prompt ") && entry.endsWith(".md"))
    .sort((a, b) => {
      const numA = Number(a.replace(/\D+/g, ""));
      const numB = Number(b.replace(/\D+/g, ""));
      return numA - numB;
    });

  if (promptFiles.length === 0) {
    throw new Error("No prompt files found.");
  }

  const configs: PromptConfig[] = [];
  for (const fileName of promptFiles) {
    const content = await fs.readFile(path.join(promptDir, fileName), "utf-8");
    const parsed = JSON.parse(content.trim()) as PromptConfig;
    configs.push(parsed);
  }

  return configs;
}

function getReferenceFiles(
  prompt: PromptConfig,
  inputs: ReferenceInputs
): File[] {
  const referenced = prompt.referenced_image_ids ?? [];
  const files: File[] = [];

  for (const rawId of referenced) {
    const cleaned = rawId.replace(/[<>]/g, "");
    const mapping = REFERENCE_INPUTS[cleaned];
    if (!mapping) continue;

    const file = inputs[mapping.key];
    if (!file) {
      if (mapping.required) {
        throw new Error(`Missing required reference image: ${mapping.label}`);
      }
      continue;
    }

    files.push(file);
  }

  return files;
}

async function generateImage(
  apiKey: string,
  prompt: PromptConfig,
  referenceFiles: File[]
) {
  const formData = new FormData();
  formData.append("model", prompt.model);
  formData.append("prompt", prompt.prompt);
  formData.append("size", prompt.size);
  if (prompt.n) formData.append("n", String(prompt.n));
  if (prompt.quality) formData.append("quality", prompt.quality);
  if (prompt.background) formData.append("background", prompt.background);
  if (prompt.input_fidelity) formData.append("input_fidelity", prompt.input_fidelity);

  referenceFiles.forEach((file) => {
    formData.append("image[]", file, file.name);
  });

  const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.error || response.statusText;
    throw new Error(`OpenAI image generation failed: ${detail}`);
  }

  const base64 = payload?.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("OpenAI image generation returned empty data.");
  }

  return Buffer.from(base64, "base64");
}

function validateFile(file: File, label: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`${label} must be an image (JPEG, PNG, WEBP, GIF).`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${label} exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const roleResult = await requireRole({ userId: user.id, allow: ["admin", "editor"] });
    if (roleResult.response) return roleResult.response;

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (!payloadRaw || typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const parsedPayload = AgentCreatePayloadSchema.parse(JSON.parse(payloadRaw));

    const files: ReferenceInputs = {
      backSignature: (formData.get("back_signature") as File) ?? null,
      backSignatureClose: (formData.get("back_signature_close") as File) ?? null,
      frontLogos: (formData.get("front_logos") as File) ?? null,
      frontCrestClose: (formData.get("front_crest_close") as File) ?? null,
      productCleanShot: (formData.get("product_clean_shot") as File) ?? null,
    };

    for (const [key, file] of Object.entries(files)) {
      if (file) {
        validateFile(file, key.replace(/_/g, " "));
      }
    }

    const requiredMissing = Object.values(REFERENCE_INPUTS)
      .filter((entry) => entry.required)
      .map((entry) => entry.key)
      .filter((key) => !files[key]);

    if (requiredMissing.length > 0) {
      return NextResponse.json(
        { error: "Missing required reference images." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment." },
        { status: 500 }
      );
    }

    const promptConfigs = await loadPromptConfigs();
    const supabase = createServiceRoleClient();
    const itemId = parsedPayload.id ?? crypto.randomUUID();

    const generatedUrls: string[] = [];
    const BUCKET = "marketplace-images";

    for (const [index, prompt] of promptConfigs.entries()) {
      const referenceFiles = getReferenceFiles(prompt, files);
      const imageBuffer = await generateImage(apiKey, prompt, referenceFiles);
      const fileName = `marketplace/${itemId}/generated-${index + 1}.png`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, imageBuffer, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload generated image: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      generatedUrls.push(publicUrl);
    }

    if (generatedUrls.length === 0) {
      throw new Error("No images were generated.");
    }

    const now = new Date().toISOString();
    const slug = parsedPayload.slug || slugify(parsedPayload.listing.title);
    const lifecycle = parsedPayload.state?.lifecycle ?? "draft";
    const visibility = parsedPayload.state?.visibility ?? "private";
    const featured = parsedPayload.state?.featured ?? { is: false };

    const signers = parsedPayload.signing?.signers ?? [];
    const conditionParts = [
      sanitizeNullable(parsedPayload.condition?.grade),
      sanitizeNullable(parsedPayload.condition?.wear),
    ].filter(Boolean);

    const metadata = {
      entity_type: parsedPayload.entity_type ?? "signed_football_jersey",
      id: itemId,
      slug,
      sku: parsedPayload.sku ?? null,
      state: {
        lifecycle,
        visibility,
        featured: {
          is: featured.is ?? false,
          order: featured.order ?? null,
        },
        publish_at: parsedPayload.state?.publish_at ?? null,
        created_at: parsedPayload.state?.created_at ?? now,
        updated_at: parsedPayload.state?.updated_at ?? now,
        created_by: parsedPayload.state?.created_by ?? user.id,
      },
      listing: {
        title: parsedPayload.listing.title,
        subtitle: parsedPayload.listing.subtitle ?? null,
        short: parsedPayload.listing.short,
        price: {
          amount: parsedPayload.listing.price.amount,
          currency: parsedPayload.listing.price.currency ?? "USD",
          compare_at: parsedPayload.listing.price.compare_at ?? null,
        },
        category: parsedPayload.listing.category,
        tags: parsedPayload.listing.tags ?? [],
      },
      jersey: parsedPayload.jersey ?? null,
      signing: {
        type: parsedPayload.signing?.type ?? "single",
        signers,
        count: parsedPayload.signing?.count ?? signers.length || 1,
        ink: parsedPayload.signing?.ink ?? { id: null, custom: null },
        placement: parsedPayload.signing?.placement ?? { id: null, custom: null },
        inscription_text: parsedPayload.signing?.inscription_text ?? null,
        sig_condition: parsedPayload.signing?.sig_condition ?? null,
      },
      condition: {
        grade: parsedPayload.condition?.grade ?? null,
        wear: parsedPayload.condition?.wear ?? null,
        notes: parsedPayload.condition?.notes ?? null,
      },
      auth: {
        status: parsedPayload.auth?.status ?? "none",
        provider_id: parsedPayload.auth?.provider_id ?? null,
        coa_refs: parsedPayload.auth?.coa_refs ?? [],
      },
      refs: parsedPayload.refs ?? {
        content_id: null,
        media_album_id: null,
        proof_bundle_id: null,
      },
      media: parsedPayload.media ?? { hero_id: null },
    };

    const signedBy = signers.length > 0 ? signers.join(", ") : null;
    const certificate = parsedPayload.auth?.coa_refs?.[0] ?? null;
    const authenticated = parsedPayload.auth?.status === "verified";

    const { data: item, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        id: itemId,
        slug,
        title: parsedPayload.listing.title,
        description: parsedPayload.listing.short,
        full_description: parsedPayload.listing.subtitle ?? null,
        price_usd: parsedPayload.listing.price.amount,
        currency: parsedPayload.listing.price.currency ?? "USD",
        image: generatedUrls[0],
        images: JSON.stringify(generatedUrls.slice(1)),
        metadata: JSON.stringify(metadata),
        category: parsedPayload.listing.category,
        status: lifecycle,
        authenticated,
        certificate,
        authenticated_date: parsedPayload.state?.publish_at ?? null,
        coa_issuer: parsedPayload.auth?.provider_id ?? null,
        signed_by: signedBy,
        condition: conditionParts.length ? conditionParts.join(" - ") : null,
        provenance: parsedPayload.condition?.notes ?? null,
        is_featured: featured.is ?? false,
        featured_order: featured.order ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    await supabase
      .from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "CREATE",
        entity_type: "marketplace_item",
        entity_id: (item as any).id,
        metadata: { item },
      });

    return NextResponse.json({ item, images: generatedUrls }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Agent create image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
