import { z } from "zod";

// Content domain schemas (posts, events, etc.)
// Scaffolded for Phase 1, will be populated in future phases

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  publishedAt: z.string().optional(),
  author: z.string().optional(),
  image: z.string().url().optional(),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  image: z.string().url().optional(),
});

export type Post = z.infer<typeof PostSchema>;
export type Event = z.infer<typeof EventSchema>;

