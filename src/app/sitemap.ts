import { MetadataRoute } from "next";
import { marketplaceListings } from "@/lib/domain";
import { posts } from "@/lib/domain";
import { events } from "@/lib/domain";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch";
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consign`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic marketplace listings
  const marketplacePages: MetadataRoute.Sitemap = (marketplaceListings as Array<{ slug: string; updatedAt?: string }>).map((listing) => ({
    url: `${baseUrl}/marketplace/${listing.slug}`,
    lastModified: listing.updatedAt ? new Date(listing.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic posts
  const postPages: MetadataRoute.Sitemap = (posts as Array<{ slug: string; updatedAt?: string }>).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : ((post as any).publishedAt ? new Date((post as any).publishedAt) : now),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic events
  const eventPages: MetadataRoute.Sitemap = (events as Array<{ slug: string; updatedAt?: string }>).map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...marketplacePages, ...postPages, ...eventPages];
}

