"use client";

import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import type { MarketplaceFormData } from "@/features/marketplace/schema";
import { BasicInfoSection } from "@/components/admin/marketplace/BasicInfoSection";
import { AthleteAuthSection } from "@/components/admin/marketplace/AthleteAuthSection";
import { SellerInfoSection } from "@/components/admin/marketplace/SellerInfoSection";
import { ConditionProvenanceSection } from "@/components/admin/marketplace/ConditionProvenanceSection";
import { StatusSettingsSection } from "@/components/admin/marketplace/StatusSettingsSection";

interface BaseSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
  watch: UseFormWatch<MarketplaceFormData>;
}

export function MarketplaceOverviewSection({ register, errors }: BaseSectionProps) {
  return <BasicInfoSection register={register} errors={errors} />;
}

export function MarketplaceStorySection({ register }: BaseSectionProps) {
  return <ConditionProvenanceSection register={register} />;
}

export function MarketplacePricingSection({ register, errors }: BaseSectionProps) {
  return <SellerInfoSection register={register} errors={errors} />;
}

export function MarketplaceAuthenticationSection({ register, errors, watch }: BaseSectionProps) {
  return <AthleteAuthSection register={register} errors={errors} watch={watch} />;
}

export function MarketplaceOperationsSection({ register, errors }: BaseSectionProps) {
  return <StatusSettingsSection register={register} errors={errors} />;
}

