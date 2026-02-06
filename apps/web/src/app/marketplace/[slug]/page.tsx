import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { MarketplaceDetailView } from "@/components/app/MarketplaceDetailView";
import { getListingHeroImage } from "@/lib/utils/marketplace";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await marketplaceService.getBySlug(slug);

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch";
  const url = `${baseUrl}/marketplace/${slug}`;
  const ogImage = getListingHeroImage(listing) || `${baseUrl}/og-logo.png`;
  const title = listing.listing?.title || "Listing";
  const category = listing.listing?.category || "collector";
  const short = listing.listing?.short || "";

  return {
    title: `${title} | Relique Marketplace`,
    description:
      short ||
      `Authenticated ${category.toLowerCase()} - ${title}. Verified by ${listing.auth?.provider_id || "Relique"}.`,
    keywords: [
      category,
      listing.signing?.signers?.[0],
      listing.auth?.provider_id,
      "authenticated collectibles",
      "memorabilia",
      "verified",
    ].filter((k): k is string => Boolean(k)),
    alternates: { canonical: url },
    openGraph: {
      title,
      description:
        short ||
        `Authenticated ${category.toLowerCase()} - ${title}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      url,
      type: "website",
      siteName: "Relique",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        short ||
        `Authenticated ${category.toLowerCase()} - ${title}`,
      images: [ogImage],
    },
  };
}

export default async function MarketplaceDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await marketplaceService.getBySlug(slug);

  if (!listing) notFound();

  return <MarketplaceDetailView listing={listing} />;
}
