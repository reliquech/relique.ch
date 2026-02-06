import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { MarketplaceDetailView } from "@/components/app/MarketplaceDetailView";

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
  const ogImage = listing.image || `${baseUrl}/og-logo.png`;

  return {
    title: `${listing.title} | Relique Marketplace`,
    description:
      listing.description ||
      `Authenticated ${listing.category.toLowerCase()} - ${listing.title}. Verified by ${listing.coaIssuer || "Relique"}.`,
    keywords: [
      listing.category,
      listing.signedBy,
      listing.coaIssuer,
      "authenticated collectibles",
      "memorabilia",
      "verified",
    ].filter((k): k is string => Boolean(k)),
    alternates: { canonical: url },
    openGraph: {
      title: listing.title,
      description:
        listing.description ||
        `Authenticated ${listing.category.toLowerCase()} - ${listing.title}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: listing.title }],
      url,
      type: "website",
      siteName: "Relique",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description:
        listing.description ||
        `Authenticated ${listing.category.toLowerCase()} - ${listing.title}`,
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
