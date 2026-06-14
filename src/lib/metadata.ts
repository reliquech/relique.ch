import { Metadata } from "next";

export const siteConfig = {
  name: "Relique",
  title: "Relique - Authentic Collectibles",
  description:
    "Probabilistic authentication for collectibles and memorabilia. Verify, authenticate, and consign your collectibles with confidence.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch",
  ogImage: "/og-logo.png",
  keywords: [
    "collectibles",
    "authentication",
    "memorabilia",
    "verification",
    "probabilistic authentication",
    "sports memorabilia",
    "certificate of authenticity",
    "COA",
    "collectibles marketplace",
    "authenticated collectibles",
    "sports collectibles",
    "autograph authentication",
  ],
  links: {
    twitter: "https://twitter.com/relique",
    github: "https://github.com/relique",
  },
};

export function constructMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} & Partial<Metadata> = {}): Metadata {
  return {
    title,
    description,
    keywords: siteConfig.keywords,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...props.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@relique",
      ...props.twitter,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...props,
  };
}
