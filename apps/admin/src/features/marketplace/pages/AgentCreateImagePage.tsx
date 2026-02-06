"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AgentCreateFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  short: z.string().min(1, "Short description is required"),
  subtitle: z.string().optional().nullable(),
  price_amount: z.number().finite().min(0, "Price must be positive"),
  price_currency: z.string().min(3).max(3).default("USD"),
  category: z.enum(["premium", "sport", "collector", "story"]),
  tags: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  lifecycle: z.enum(["draft", "published", "archived"]).default("draft"),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
  featured_is: z.boolean().optional(),
  featured_order: z.number().finite().optional().nullable(),
  publish_at: z.string().optional().nullable(),
  sport: z.enum(["football", "soccer"]).default("football"),
  club_id: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  kit: z.enum(["home", "away", "third", "goalkeeper", "training", "special"]).default("home"),
  edition: z.enum(["replica", "authentic", "player_issue", "match_prepared", "match_worn"]).default("replica"),
  brand_id: z.string().optional().nullable(),
  size_id: z.string().optional().nullable(),
  size_region: z.string().optional().nullable(),
  style_code: z.string().optional().nullable(),
  signing_type: z.enum(["single", "multi"]).default("single"),
  signers: z.string().optional().nullable(),
  signing_count: z.number().finite().optional().nullable(),
  ink_id: z.string().optional().nullable(),
  placement_id: z.string().optional().nullable(),
  inscription_text: z.string().optional().nullable(),
  sig_condition: z.enum(["A", "B", "C", "D", "unknown"]).default("unknown"),
  condition_grade: z.enum(["A", "B", "C", "D", "F", "unknown"]).default("unknown"),
  condition_wear: z
    .enum(["new_with_tags", "new_no_tags", "lightly_used", "used", "heavily_used", "match_worn"])
    .default("new_with_tags"),
  condition_notes: z.string().optional().nullable(),
  auth_status: z.enum(["none", "pending", "verified", "rejected"]).default("none"),
  auth_provider_id: z.string().optional().nullable(),
  auth_coa_refs: z.string().optional().nullable(),
});

type AgentCreateFormData = z.infer<typeof AgentCreateFormSchema>;

type ReferenceKey =
  | "backSignature"
  | "backSignatureClose"
  | "frontLogos"
  | "frontCrestClose"
  | "productCleanShot";

type ReferenceFiles = Record<ReferenceKey, File | null>;

const defaultReferenceFiles: ReferenceFiles = {
  backSignature: null,
  backSignatureClose: null,
  frontLogos: null,
  frontCrestClose: null,
  productCleanShot: null,
};

function parseList(value?: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeNullable(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function AgentCreateImagePage() {
  const router = useRouter();
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFiles>(defaultReferenceFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClassName =
    "border-border/60 bg-bg-0/30 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";
  const textareaClassName =
    "flex w-full rounded-none border border-border/60 bg-bg-0/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";
  const selectClassName =
    "flex h-10 w-full rounded-none border border-border/60 bg-bg-0/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";
  const checkboxClassName =
    "h-4 w-4 rounded-none border border-border/60 bg-bg-0/30 accent-[var(--relique-primary-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentCreateFormData>({
    resolver: zodResolver(AgentCreateFormSchema) as Resolver<AgentCreateFormData>,
    defaultValues: {
      price_currency: "USD",
      category: "premium",
      lifecycle: "draft",
      visibility: "private",
      featured_is: false,
      sport: "football",
      kit: "home",
      edition: "replica",
      signing_type: "single",
      sig_condition: "unknown",
      condition_grade: "unknown",
      condition_wear: "new_with_tags",
      auth_status: "none",
    },
  });

  const handleFileChange = (key: ReferenceKey) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setReferenceFiles((prev) => ({ ...prev, [key]: file }));
    };

  const buildPayload = (data: AgentCreateFormData) => {
    const tags = parseList(data.tags);
    const signers = parseList(data.signers);
    const coaRefs = parseList(data.auth_coa_refs);

    return {
      entity_type: "signed_football_jersey",
      slug: sanitizeNullable(data.slug),
      sku: sanitizeNullable(data.sku),
      state: {
        lifecycle: data.lifecycle,
        visibility: data.visibility,
        featured: {
          is: data.featured_is ?? false,
          order:
            typeof data.featured_order === "number" && Number.isFinite(data.featured_order)
              ? data.featured_order
              : null,
        },
        publish_at: sanitizeNullable(data.publish_at),
      },
      listing: {
        title: data.title,
        subtitle: sanitizeNullable(data.subtitle),
        short: data.short,
        price: {
          amount: data.price_amount,
          currency: data.price_currency,
          compare_at: null,
        },
        category: data.category,
        tags,
      },
      jersey: {
        sport: data.sport,
        club_id: sanitizeNullable(data.club_id),
        season: sanitizeNullable(data.season),
        kit: data.kit,
        edition: data.edition,
        brand: {
          id: sanitizeNullable(data.brand_id),
          custom: null,
        },
        size: {
          id: sanitizeNullable(data.size_id),
          region: sanitizeNullable(data.size_region),
          custom: null,
        },
        style_code: sanitizeNullable(data.style_code),
      },
      signing: {
        type: data.signing_type,
        signers,
        count:
          typeof data.signing_count === "number" && Number.isFinite(data.signing_count)
            ? data.signing_count
            : signers.length || 1,
        ink: {
          id: sanitizeNullable(data.ink_id),
          custom: null,
        },
        placement: {
          id: sanitizeNullable(data.placement_id),
          custom: null,
        },
        inscription_text: sanitizeNullable(data.inscription_text),
        sig_condition: data.sig_condition,
      },
      condition: {
        grade: data.condition_grade,
        wear: data.condition_wear,
        notes: sanitizeNullable(data.condition_notes),
      },
      auth: {
        status: data.auth_status,
        provider_id: sanitizeNullable(data.auth_provider_id),
        coa_refs: coaRefs,
      },
      refs: {
        content_id: null,
        media_album_id: null,
        proof_bundle_id: null,
      },
      media: {
        hero_id: null,
      },
    };
  };

  const onSubmit = async (data: AgentCreateFormData) => {
    setIsSubmitting(true);
    try {
      const missingRefs = [
        !referenceFiles.backSignature && "Back name/number signature",
        !referenceFiles.backSignatureClose && "Back signature close-up",
        !referenceFiles.frontLogos && "Front logos/sponsor",
        !referenceFiles.frontCrestClose && "Front crest close-up",
      ].filter(Boolean);

      if (missingRefs.length > 0) {
        toast.error(`Missing required reference images: ${missingRefs.join(", ")}`);
        return;
      }

      const payload = buildPayload(data);
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (referenceFiles.backSignature) {
        formData.append("back_signature", referenceFiles.backSignature);
      }
      if (referenceFiles.backSignatureClose) {
        formData.append("back_signature_close", referenceFiles.backSignatureClose);
      }
      if (referenceFiles.frontLogos) {
        formData.append("front_logos", referenceFiles.frontLogos);
      }
      if (referenceFiles.frontCrestClose) {
        formData.append("front_crest_close", referenceFiles.frontCrestClose);
      }
      if (referenceFiles.productCleanShot) {
        formData.append("product_clean_shot", referenceFiles.productCleanShot);
      }

      const response = await fetch("/api/marketplace/agent-create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate images");
      }

      toast.success("Images generated and marketplace item created.");
      router.push("/admin/items");
    } catch (error) {
      console.error("Agent create failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="relative diagonal-bg clip-path-slant-lg border border-border bg-surface/40 backdrop-blur-md p-8 overflow-hidden">
        <div className="relative z-10 flex items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/items")}
              aria-label="Back to items"
              className="clip-path-slant border-border/70 bg-bg-0/40 text-white hover:bg-[color:var(--relique-highlight-ice)] hover:text-[color:var(--relique-navy)] transition-base"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  <span className="w-1 h-4 bg-[color:var(--relique-primary-blue)]" />
                  <span className="w-1 h-4 bg-[color:var(--relique-accent-blue)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[color:var(--relique-primary-blue)]">
                  Marketplace
                </span>
              </div>

              <h1 className="text-h1 text-white">
                Agent <span className="text-[color:var(--relique-primary-blue)]">Create</span>
              </h1>
              <p className="mt-2 text-body max-w-2xl text-[color:var(--relique-text-secondary)]">
                Upload reference images, fill out the jersey details, and generate the full marketplace image set automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Listing</CardTitle>
              <CardDescription>Core marketplace information for the listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  className={cn(inputClassName, errors.title && "border-destructive")}
                  placeholder="e.g., Zinedine Zidane Signed Jersey"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="short">
                  Short Description <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="short"
                  {...register("short")}
                  rows={4}
                  className={cn(textareaClassName, errors.short && "border-destructive")}
                  placeholder="Short summary for the listing"
                />
                {errors.short && <p className="text-sm text-destructive">{errors.short.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <textarea
                  id="subtitle"
                  {...register("subtitle")}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Optional extended description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_amount">
                    Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price_amount"
                    type="number"
                    step="0.01"
                    {...register("price_amount", { valueAsNumber: true })}
                    className={cn(inputClassName, errors.price_amount && "border-destructive")}
                    placeholder="999"
                  />
                  {errors.price_amount && (
                    <p className="text-sm text-destructive">{errors.price_amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_currency">Currency</Label>
                  <Input
                    id="price_currency"
                    {...register("price_currency")}
                    className={inputClassName}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" {...register("category")} className={selectClassName}>
                    <option value="premium">Premium</option>
                    <option value="sport">Sport</option>
                    <option value="collector">Collector</option>
                    <option value="story">Story</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    className={inputClassName}
                    placeholder="zidane, real-madrid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" {...register("slug")} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register("sku")} className={inputClassName} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Reference Images</CardTitle>
              <CardDescription>Provide clean shots to anchor the 6 prompt variations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Back name/number signature <span className="text-destructive">*</span>
                </Label>
                <Input type="file" accept="image/*" onChange={handleFileChange("backSignature")} />
              </div>
              <div className="space-y-2">
                <Label>
                  Back signature close-up <span className="text-destructive">*</span>
                </Label>
                <Input type="file" accept="image/*" onChange={handleFileChange("backSignatureClose")} />
              </div>
              <div className="space-y-2">
                <Label>
                  Front logos/sponsor <span className="text-destructive">*</span>
                </Label>
                <Input type="file" accept="image/*" onChange={handleFileChange("frontLogos")} />
              </div>
              <div className="space-y-2">
                <Label>
                  Front crest close-up <span className="text-destructive">*</span>
                </Label>
                <Input type="file" accept="image/*" onChange={handleFileChange("frontCrestClose")} />
              </div>
              <div className="space-y-2">
                <Label>Product clean shot (optional)</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange("productCleanShot")} />
              </div>
              <p className="text-xs text-muted-foreground">
                Required: 4 images. Optional clean shot improves prompt 1/2/4/5 coverage.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Jersey Details</CardTitle>
              <CardDescription>Core jersey specs for metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <select id="sport" {...register("sport")} className={selectClassName}>
                    <option value="football">Football</option>
                    <option value="soccer">Soccer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club_id">Club ID</Label>
                  <Input id="club_id" {...register("club_id")} className={inputClassName} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Input id="season" {...register("season")} className={inputClassName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kit">Kit</Label>
                  <select id="kit" {...register("kit")} className={selectClassName}>
                    <option value="home">Home</option>
                    <option value="away">Away</option>
                    <option value="third">Third</option>
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="training">Training</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edition">Edition</Label>
                  <select id="edition" {...register("edition")} className={selectClassName}>
                    <option value="replica">Replica</option>
                    <option value="authentic">Authentic</option>
                    <option value="player_issue">Player Issue</option>
                    <option value="match_prepared">Match Prepared</option>
                    <option value="match_worn">Match Worn</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_id">Brand</Label>
                  <Input id="brand_id" {...register("brand_id")} className={inputClassName} placeholder="nike" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_id">Size</Label>
                  <Input id="size_id" {...register("size_id")} className={inputClassName} placeholder="L" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_region">Size Region</Label>
                  <Input id="size_region" {...register("size_region")} className={inputClassName} placeholder="EU" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style_code">Style Code</Label>
                <Input id="style_code" {...register("style_code")} className={inputClassName} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Signing</CardTitle>
              <CardDescription>Signature metadata for the signed jersey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signing_type">Type</Label>
                  <select id="signing_type" {...register("signing_type")} className={selectClassName}>
                    <option value="single">Single</option>
                    <option value="multi">Multi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signing_count">Count</Label>
                  <Input
                    id="signing_count"
                    type="number"
                    {...register("signing_count", { valueAsNumber: true })}
                    className={inputClassName}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signers">Signers</Label>
                <Input
                  id="signers"
                  {...register("signers")}
                  className={inputClassName}
                  placeholder="zinedine-zidane"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ink_id">Ink</Label>
                  <Input id="ink_id" {...register("ink_id")} className={inputClassName} placeholder="black_sharpie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement_id">Placement</Label>
                  <Input id="placement_id" {...register("placement_id")} className={inputClassName} placeholder="front_chest" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscription_text">Inscription</Label>
                <Input id="inscription_text" {...register("inscription_text")} className={inputClassName} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sig_condition">Signature Condition</Label>
                <select id="sig_condition" {...register("sig_condition")} className={selectClassName}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Condition</CardTitle>
              <CardDescription>Overall condition details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition_grade">Grade</Label>
                  <select id="condition_grade" {...register("condition_grade")} className={selectClassName}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition_wear">Wear</Label>
                  <select id="condition_wear" {...register("condition_wear")} className={selectClassName}>
                    <option value="new_with_tags">New with tags</option>
                    <option value="new_no_tags">New no tags</option>
                    <option value="lightly_used">Lightly used</option>
                    <option value="used">Used</option>
                    <option value="heavily_used">Heavily used</option>
                    <option value="match_worn">Match worn</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition_notes">Notes</Label>
                <textarea
                  id="condition_notes"
                  {...register("condition_notes")}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Any condition notes"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>COA and verification details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth_status">Status</Label>
                <select id="auth_status" {...register("auth_status")} className={selectClassName}>
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth_provider_id">Provider ID</Label>
                <Input id="auth_provider_id" {...register("auth_provider_id")} className={inputClassName} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth_coa_refs">COA References</Label>
                <Input
                  id="auth_coa_refs"
                  {...register("auth_coa_refs")}
                  className={inputClassName}
                  placeholder="COA-001, COA-002"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/40 border-border/60">
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>Lifecycle and visibility controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lifecycle">Lifecycle</Label>
                  <select id="lifecycle" {...register("lifecycle")} className={selectClassName}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <select id="visibility" {...register("visibility")} className={selectClassName}>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input id="featured_is" type="checkbox" {...register("featured_is")} className={checkboxClassName} />
                <Label htmlFor="featured_is" className="cursor-pointer">
                  Feature this item
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured_order">Featured Order</Label>
                  <Input
                    id="featured_order"
                    type="number"
                    {...register("featured_order", { valueAsNumber: true })}
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publish_at">Publish At</Label>
                  <Input id="publish_at" type="datetime-local" {...register("publish_at")} className={inputClassName} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/items")}
            disabled={isSubmitting}
            className="clip-path-slant border-border/70 bg-bg-0/30 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-[color:var(--relique-highlight-ice)] hover:text-[color:var(--relique-navy)] transition-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="clip-path-slant bg-[color:var(--relique-primary-blue)] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-[color:var(--relique-accent-blue)] shadow-[0_20px_40px_rgba(28,77,141,0.2)] transition-base"
          >
            {isSubmitting ? "Generating..." : "Generate & Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
