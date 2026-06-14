import { z } from "zod";

export const VerifyStatusSchema = z.enum(["qualified", "inconclusive", "disqualified"]);
export type VerifyStatus = z.infer<typeof VerifyStatusSchema>;

export const VerifyInputTypeSchema = z.enum(["code", "qr", "certificate"]);
export type VerifyInputType = z.infer<typeof VerifyInputTypeSchema>;

export const VerifyResultSchema = z.object({
  productId: z.string(),
  itemName: z.string(),
  signatures: z.number().int().min(0),
  status: VerifyStatusSchema,
  date: z.string(),
  certificate: z.string(),
  authenticationResult: z.string(),
  dateOfAnalysis: z.string(),
  marketplaceSlug: z.string().optional(),
  marketplaceUrl: z.string().optional(),
  signerNames: z.array(z.string()).optional(),
  itemType: z.string().optional(),
  grade: z.string().optional(),
  heroImageUrl: z.string().optional(),
  galleryImageUrls: z.array(z.string()).optional(),
});

export const VerifyHistoryEntrySchema = z.object({
  productId: z.string(),
  result: VerifyStatusSchema,
  timestamp: z.number(),
});

export const ProductIdSchema = z.string().regex(
  /^RLQ-[A-Z0-9]+-[A-Z0-9]+$/,
  "Product ID must be in format RLQ-XXXX-XXXX (e.g., RLQ-QUAL-001)"
);

export const VerifyRunInputSchema = z.object({
  inputType: VerifyInputTypeSchema,
  code: z.string().min(1),
});

export const VerifyMappingEntrySchema = z.object({
  status: VerifyStatusSchema,
  signatures: z.number().int().min(0).optional(),
  itemName: z.string().optional(),
  certificate: z.string().optional(),
});

export type VerifyResult = z.infer<typeof VerifyResultSchema>;
export type VerifyHistoryEntry = z.infer<typeof VerifyHistoryEntrySchema>;
export type VerifyRunInput = z.infer<typeof VerifyRunInputSchema>;
export type VerifyMappingEntry = z.infer<typeof VerifyMappingEntrySchema>;

