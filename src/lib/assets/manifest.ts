export interface AssetEntry {
  id: string;
  src: string;
  alt: string;
  creditText?: string;
  creditUrl?: string;
  tags: string[];
  dominantTone: "dark" | "light";
  section: string;
  component: string;
  variant?: "hero" | "card" | "banner" | "avatar" | "logo-strip";
  aspectRatio?: string;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  // Home page assets
  {
    id: "home.hero",
    src: "https://picsum.photos/1200/800?random=1",
    alt: "Premium collectibles and memorabilia",
    creditText: "Unsplash",
    creditUrl: "https://unsplash.com",
    tags: ["collectibles", "luxury", "premium", "memorabilia"],
    dominantTone: "dark",
    section: "home",
    component: "HeroSection",
    variant: "hero",
    aspectRatio: "3:2",
  },
  {
    id: "home.bento.1",
    src: "https://picsum.photos/800/600?random=sig1",
    alt: "Signature verification",
    tags: ["signature", "autograph", "verification"],
    dominantTone: "light",
    section: "home",
    component: "QuickActions",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "home.bento.2",
    src: "https://picsum.photos/800/600?random=mem1",
    alt: "Marketplace items",
    tags: ["marketplace", "memorabilia", "collectibles"],
    dominantTone: "light",
    section: "home",
    component: "QuickActions",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "home.bento.3",
    src: "https://picsum.photos/800/600?random=doc1",
    alt: "Consignment process",
    tags: ["consign", "document", "process"],
    dominantTone: "light",
    section: "home",
    component: "QuickActions",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "home.bento.4",
    src: "https://picsum.photos/800/600?random=expert1",
    alt: "Learn more about authentication",
    tags: ["about", "authentication", "expert"],
    dominantTone: "light",
    section: "home",
    component: "QuickActions",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "home.featured.items",
    src: "https://picsum.photos/800/600?random=mem2",
    alt: "Featured marketplace items",
    tags: ["marketplace", "featured", "sports"],
    dominantTone: "light",
    section: "home",
    component: "FeaturedItems",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "home.featured.posts",
    src: "https://picsum.photos/1200/800?random=post1",
    alt: "Featured blog post",
    tags: ["blog", "post", "featured"],
    dominantTone: "light",
    section: "home",
    component: "FeaturedPosts",
    variant: "card",
    aspectRatio: "3:2",
  },
  {
    id: "home.events",
    src: "https://picsum.photos/800/600?random=stad1",
    alt: "Upcoming events",
    tags: ["events", "stadium", "sports"],
    dominantTone: "light",
    section: "home",
    component: "UpcomingEvents",
    variant: "card",
    aspectRatio: "4:3",
  },

  // Marketplace assets
  {
    id: "marketplace.card",
    src: "https://picsum.photos/800/600?random=mem3",
    alt: "Marketplace listing",
    tags: ["marketplace", "listing", "item"],
    dominantTone: "light",
    section: "marketplace",
    component: "MarketplaceCard",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "marketplace.detail.hero",
    src: "https://picsum.photos/1200/800?random=detail1",
    alt: "Item detail view",
    tags: ["marketplace", "detail", "hero"],
    dominantTone: "light",
    section: "marketplace",
    component: "ItemGallery",
    variant: "hero",
    aspectRatio: "3:2",
  },

  // Verify assets
  {
    id: "verify.hero",
    src: "https://picsum.photos/1200/800?random=verify1",
    alt: "Product verification",
    tags: ["verify", "verification", "signature"],
    dominantTone: "light",
    section: "verify",
    component: "VerifyPage",
    variant: "hero",
    aspectRatio: "3:2",
  },
  {
    id: "verify.result.bg",
    src: "https://picsum.photos/800/600?random=result1",
    alt: "Verification result background",
    tags: ["verify", "result", "document"],
    dominantTone: "light",
    section: "verify",
    component: "VerifyResult",
    variant: "banner",
    aspectRatio: "16:9",
  },

  // Consign assets
  {
    id: "consign.hero",
    src: "https://picsum.photos/1200/800?random=consign1",
    alt: "Consignment process",
    tags: ["consign", "package", "premium"],
    dominantTone: "light",
    section: "consign",
    component: "ConsignPage",
    variant: "hero",
    aspectRatio: "3:2",
  },
  {
    id: "consign.form.banner",
    src: "https://picsum.photos/1200/400?random=form1",
    alt: "Consignment form banner",
    tags: ["consign", "form", "shipping"],
    dominantTone: "light",
    section: "consign",
    component: "ConsignForm",
    variant: "banner",
    aspectRatio: "3:1",
  },

  // About assets
  {
    id: "about.section.4_1",
    src: "https://picsum.photos/800/600?random=about1",
    alt: "Who We Are",
    tags: ["about", "mission", "trust"],
    dominantTone: "light",
    section: "about",
    component: "AnchorSection",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "about.section.4_2",
    src: "https://picsum.photos/800/600?random=about2",
    alt: "One to Appreciate",
    tags: ["about", "appreciation", "collectibles"],
    dominantTone: "light",
    section: "about",
    component: "AnchorSection",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "about.section.4_3",
    src: "https://picsum.photos/800/600?random=about3",
    alt: "Question of Trust",
    tags: ["about", "trust", "security"],
    dominantTone: "light",
    section: "about",
    component: "AnchorSection",
    variant: "card",
    aspectRatio: "4:3",
  },
  {
    id: "about.section.4_3_2",
    src: "https://picsum.photos/800/600?random=about4",
    alt: "Artificial Intelligence",
    tags: ["about", "ai", "technology"],
    dominantTone: "light",
    section: "about",
    component: "AnchorSection",
    variant: "card",
    aspectRatio: "4:3",
  },

  // Legal assets
  {
    id: "legal.hero",
    src: "https://picsum.photos/1200/400?random=legal1",
    alt: "Legal information",
    tags: ["legal", "documents", "policies"],
    dominantTone: "light",
    section: "legal",
    component: "LegalLayout",
    variant: "banner",
    aspectRatio: "3:1",
  },
];

export function getAssetById(id: string): AssetEntry | undefined {
  return ASSET_MANIFEST.find((asset) => asset.id === id);
}

export function getAssetsBySection(section: string): AssetEntry[] {
  return ASSET_MANIFEST.filter((asset) => asset.section === section);
}

export function getAssetsByComponent(component: string): AssetEntry[] {
  return ASSET_MANIFEST.filter((asset) => asset.component === component);
}

