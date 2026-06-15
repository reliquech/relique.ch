"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MarketplaceForm } from "@/components/admin/marketplace/MarketplaceForm";
import { useForm, FormProvider } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MarketplaceFormSchema, type MarketplaceFormData } from "@/features/marketplace/schema";
import { useMarketplaceAutosave } from "@/features/marketplace/hooks/useMarketplaceAutosave";
import { useOnlineStatus } from "@/features/marketplace/hooks/useOnlineStatus";
import { useUnsavedChangesGuard } from "@/features/marketplace/hooks/useUnsavedChangesGuard";
import {
  createMarketplaceDraft,
  updateMarketplaceItem,
} from "@/features/marketplace/services/marketplaceEditorService";

interface MarketplaceEditorPageProps {
  mode: "create" | "edit";
  itemId?: string;
  initialItem?: unknown;
  canEdit?: boolean;
}

export function MarketplaceEditorPage({
  mode,
  itemId,
  initialItem,
  canEdit = true,
}: MarketplaceEditorPageProps) {
  const router = useRouter();
  const online = useOnlineStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(itemId);

  const methods = useForm<MarketplaceFormData>({
    resolver: zodResolver(MarketplaceFormSchema) as Resolver<MarketplaceFormData>,
    defaultValues: {
      image: "",
      images: null,
      status: "draft",
      authenticated: false,
      is_featured: false,
      seo_title: "",
      seo_description: "",
    },
  });

  const { watch, formState: { isDirty }, reset } = methods;
  const currentValues = watch();

  useMarketplaceAutosave({
    itemId: draftId,
    values: currentValues,
    dirty: isDirty,
    online,
    enabled: canEdit && isDirty,
    uploading: false,
  });

  const confirmNavigation = useUnsavedChangesGuard(isDirty);

  const goToItems = () => {
    if (confirmNavigation()) router.push("/admin/items");
  };

  const handleSubmit = async (data: MarketplaceFormData) => {
    if (!canEdit) {
      toast.error("You do not have permission to modify marketplace items");
      return;
    }
    if (!online) {
      toast.error("You are offline. Reconnect before saving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const status = data.status;
      if (draftId) {
        await updateMarketplaceItem(draftId, data, status);
      } else {
        const result = await createMarketplaceDraft(data, status);
        setDraftId(result.id);
      }
      reset(data);
      toast.success(status === "published" ? "Marketplace item published" : "Marketplace item saved");
      if (status === "published") router.push("/admin/items");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save marketplace item");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-2 border-b border-border pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Marketplace editor
          </p>
          <h1 className="text-3xl font-bold text-white">
            {mode === "create" ? "Create marketplace item" : "Edit marketplace item"}
          </h1>
          <p className="text-sm text-gray-400">
            Overview, Story, Pricing, Authentication, Media, and Operations.
          </p>
        </div>

        <div data-marketplace-editor-form="true">
          <MarketplaceForm
            onSubmit={handleSubmit}
            onCancel={goToItems}
            isSubmitting={isSubmitting}
            initialData={initialItem}
          />
        </div>
      </div>
    </FormProvider>
  );
}
