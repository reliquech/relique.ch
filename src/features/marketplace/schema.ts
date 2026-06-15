import { z } from "zod";

export const MarketplaceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  full_description: z.string().optional().nullable(),
  price_usd: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image is required"),
  images: z.array(z.string()).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  authenticated: z.boolean().optional(),
  certificate: z.string().optional().nullable(),
  authenticated_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  signed_by: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_rating: z.number().min(0).max(5).optional().nullable(),
  seller_verified: z.boolean().optional().nullable(),
  is_featured: z.boolean().optional(),
  featured_order: z.number().optional().nullable(),
  commission_rate: z.number().min(0).max(100).optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export type MarketplaceFormData = z.infer<typeof MarketplaceFormSchema>;
