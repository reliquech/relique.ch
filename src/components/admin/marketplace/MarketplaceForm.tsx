"use client";

import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { MarketplaceImageSection } from "./MarketplaceImageSection";
import { useMarketplaceFormImages } from "@/features/marketplace/hooks/useMarketplaceFormImages";
import { type MarketplaceFormData } from "@/features/marketplace/schema";
import { BasicInfoSection } from "./BasicInfoSection";
import { AthleteCollectorCategorySection } from "./AthleteCollectorCategorySection";
import { PricingConditionSection } from "./PricingConditionSection";
import { AuthenticationRecordsSection } from "./AuthenticationRecordsSection";
import { PublishingSeoSection } from "./PublishingSeoSection";
import { MarketplaceFormFooter } from "./MarketplaceFormFooter";
import { applyMarketplaceInitialData } from "./mapMarketplaceInitialData";

export * from "@/features/marketplace/schema";

interface MarketplaceFormProps {
  onSubmit: (data: MarketplaceFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: unknown;
}

export function MarketplaceForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData,
}: MarketplaceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useFormContext<MarketplaceFormData>();

  const images = useMarketplaceFormImages(setValue);

  useEffect(() => {
    if (initialData) {
      applyMarketplaceInitialData(
        initialData,
        setValue,
        reset,
        images.setCoverImage,
        images.setAdditionalImages
      );
    }
  }, [initialData, reset, setValue, images.setCoverImage, images.setAdditionalImages]);

  const onFormSubmit = async (data: MarketplaceFormData) => {
    try {
      const finalized = await images.finalizeImagesForSubmit(data);
      await onSubmit(finalized);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("finalize")) {
        toast.error(error.message);
      }
      console.error("Form submission error:", error);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (images.coverImage?.status === "uploaded" && images.coverImage.url) {
      setValue("image", images.coverImage.url, { shouldValidate: true });
    }
    void handleSubmit(onFormSubmit)(event);
  };

  const handleCancel = async () => {
    await images.handleCancel();
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <input type="hidden" {...register("image")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <BasicInfoSection register={register} errors={errors} />

          {/* Section 2: Athlete / Collector / Category */}
          <AthleteCollectorCategorySection register={register} errors={errors} />

          {/* Section 3: Pricing & Condition */}
          <PricingConditionSection register={register} errors={errors} />
        </div>

        <div className="space-y-6">
          {/* Section 4: Media Gallery */}
          <MarketplaceImageSection
            coverImage={images.coverImage}
            additionalImages={images.additionalImages}
            onCoverChange={images.handleCoverImageChange}
            onCoverRemove={images.removeCoverImage}
            onAdditionalChange={images.handleAdditionalImagesChange}
            onAdditionalRemove={images.removeAdditionalImage}
            coverError={errors.image?.message}
            isUploading={images.isUploading}
          />

          {/* Section 5: Authentication Records */}
          <AuthenticationRecordsSection register={register} watch={watch} />

          {/* Section 6: Publishing & SEO */}
          <PublishingSeoSection register={register} errors={errors} watch={watch} />
        </div>
      </div>

      <MarketplaceFormFooter
        isSubmitting={isSubmitting}
        isUploading={images.isUploading}
        isEdit={Boolean(initialData)}
        onCancel={handleCancel}
      />
    </form>
  );
}
