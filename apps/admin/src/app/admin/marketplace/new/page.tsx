"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceForm } from "@/features/marketplace/components/MarketplaceForm";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketplaceFormData } from "@/features/marketplace/components/MarketplaceForm";

export default function NewMarketplacePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToItems = () => router.push("/admin/items");

  const handleSubmit = async (data: MarketplaceFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare data for API - matching the API route schema
      // Convert undefined to null for optional fields
      const apiData = {
        slug: data.title
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        title: data.title,
        description: data.description,
        full_description: data.full_description ?? null,
        price_usd: data.price_usd,
        currency: "USD",
        image: data.image,
        images: data.images ?? null,
        category: data.category,
        status: data.status,
        authenticated: data.authenticated ?? false,
        certificate: data.certificate ?? null,
        authenticated_date: data.authenticated_date ?? null,
        coa_issuer: data.coa_issuer ?? null,
        signed_by: data.signed_by ?? null,
        condition: data.condition ?? null,
        provenance: data.provenance ?? null,
        seller_name: data.seller_name ?? null,
        seller_rating: data.seller_rating ?? null,
        seller_verified: data.seller_verified ?? null,
        is_featured: data.is_featured ?? false,
        featured_order: data.featured_order ?? null,
        commission_rate: data.commission_rate ?? null,
      };

      // Call API directly to send all fields
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create marketplace item");
      }

      toast.success("Marketplace item created successfully!");
      goToItems();
    } catch (error) {
      console.error("Failed to create marketplace item:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create marketplace item. Please try again."
      );
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20 text-[color:var(--relique-text-secondary)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[color:var(--relique-primary-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="relative diagonal-bg clip-path-slant-lg border border-border bg-surface/40 backdrop-blur-md p-8 overflow-hidden">
        <div className="relative z-10 flex items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <Button
              variant="outline"
              size="icon"
              onClick={goToItems}
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
                Create <span className="text-[color:var(--relique-primary-blue)]">New</span> Item
              </h1>
              <p className="mt-2 text-body max-w-2xl text-[color:var(--relique-text-secondary)]">
                Fill in the listing details, upload images, and set the publishing status. Required fields are
                marked with an asterisk.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goToItems}
              className="clip-path-slant border-border/70 bg-bg-0/30 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-[color:var(--relique-highlight-ice)] hover:text-[color:var(--relique-navy)] transition-base"
            >
              View Items
            </Button>
          </div>
        </div>
      </section>

      <MarketplaceForm onSubmit={handleSubmit} onCancel={goToItems} isSubmitting={isSubmitting} />
    </div>
  );
}
