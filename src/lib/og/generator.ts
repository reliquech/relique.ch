/**
 * OG Image Generation Utilities (Mock)
 * 
 * In production, these would generate actual OG images using a service
 * like @vercel/og or a dedicated image generation API.
 */

export interface OGImageConfig {
  title: string;
  description?: string;
  type: "default" | "marketplace" | "post" | "event";
  image?: string;
  productCode?: string;
  category?: string;
  date?: string;
}

export function generateOGImageUrl(config: OGImageConfig): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch";
  
  // Mock: In production, this would call an OG image generation API
  // For now, return a placeholder or use the provided image
  if (config.image) {
    return config.image;
  }

  // Generate a placeholder OG image URL based on type
  switch (config.type) {
    case "marketplace":
      return `${baseUrl}/api/og/marketplace?title=${encodeURIComponent(config.title)}&code=${config.productCode || ""}`;
    case "post":
      return `${baseUrl}/api/og/post?title=${encodeURIComponent(config.title)}&category=${config.category || ""}`;
    case "event":
      return `${baseUrl}/api/og/event?title=${encodeURIComponent(config.title)}&date=${config.date || ""}`;
    default:
      return `${baseUrl}/api/og/default?title=${encodeURIComponent(config.title)}`;
  }
}

export function getOGImageDimensions(type: "default" | "marketplace" | "post" | "event"): { width: number; height: number } {
  // Standard OG image size: 1200x630 (1.91:1 ratio)
  return { width: 1200, height: 630 };
}

