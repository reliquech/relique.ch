import type { UseFormReset, UseFormSetValue } from "react-hook-form";
import type { MarketplaceFormData } from "@/features/marketplace/schema";
import type { ImageUploadItem } from "./MarketplaceImageSection";

type UploadItem = ImageUploadItem & {
  file?: File;
  path?: string;
};

export function applyMarketplaceInitialData(
  initialData: unknown,
  setValue: UseFormSetValue<MarketplaceFormData>,
  reset: UseFormReset<MarketplaceFormData>,
  setCoverImage: (item: UploadItem | null) => void,
  setAdditionalImages: (items: UploadItem[]) => void
) {
  if (!initialData || typeof initialData !== "object") return;

  const data = initialData as Record<string, Record<string, unknown>>;
  const state = data.state || {};
  const listing = data.listing || {};
  const signing = data.signing || {};
  const condition = data.condition || {};
  const auth = data.auth || {};
  const media = data.media || {};

  if (media.hero_id) {
    setCoverImage({
      id: "cover-init",
      url: String(media.hero_id),
      status: "uploaded",
    });
    setValue("image", String(media.hero_id));
  } else {
    setCoverImage(null);
    setValue("image", "");
  }

  if (Array.isArray(media.gallery)) {
    const mappedAdd = (media.gallery as string[]).map((url, index) => ({
      id: `add-init-${index}`,
      url,
      status: "uploaded" as const,
    }));
    setAdditionalImages(mappedAdd);
    setValue("images", media.gallery as string[]);
  } else {
    setAdditionalImages([]);
    setValue("images", null);
  }

  const listingPrice = listing.price as { amount?: number } | undefined;
  const authCoaRefs = auth.coa_refs as string[] | undefined;
  const signingSigners = signing.signers as string[] | undefined;
  const featured = state.featured as { is?: boolean; order?: number | null } | undefined;

  reset({
    title: String(listing.title || ""),
    description: String(listing.short || ""),
    full_description: String(listing.subtitle || ""),
    price_usd: listingPrice?.amount || 0,
    category: String(listing.category || ""),
    image: String(media.hero_id || ""),
    images: (media.gallery as string[] | null) || null,
    status: (String(state.lifecycle || "draft") as MarketplaceFormData["status"]) || "draft",
    authenticated: auth.status === "verified",
    certificate: authCoaRefs?.[0] || "",
    coa_issuer: String(auth.provider_id || ""),
    signed_by: signingSigners?.join(", ") || "",
    condition: String(condition.notes || ""),
    provenance: String(condition.provenance || ""),
    seller_name: String(listing.seller_name || ""),
    seller_rating: (listing.seller_rating as number | null) ?? null,
    seller_verified: Boolean(listing.seller_verified),
    is_featured: Boolean(featured?.is),
    featured_order: featured?.order ?? null,
    commission_rate: (listing.commission_rate as number | null) ?? null,
    seo_title: String(listing.seo_title || ""),
    seo_description: String(listing.seo_description || ""),
  });
}
