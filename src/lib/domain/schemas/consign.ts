import { z } from "zod";

export const SubmissionStatusSchema = z.enum([
  "draft",
  "submitted",
  "in_review",
  "complete",
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const ConsignFileSchema = z.object({
  name: z.string(),
  size: z.number().min(0),
  type: z.string(),
});

export const ConsignSubmissionSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  itemDescription: z.string().min(10),
  category: z.string().optional(),
  estimatedValue: z.number().min(0).optional(),
  coaIssuer: z.string().optional(),
  howDidYouHear: z.string().optional(),
  files: z.array(ConsignFileSchema).optional(),
  status: SubmissionStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ConsignDraftSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  itemDescription: z.string().optional(),
  category: z.string().optional(),
  signedBy: z.string().optional(),
  numberOfSignatures: z.number().int().min(0).optional(),
  estimatedValue: z.number().min(0).optional(),
  provenance: z.string().optional(),
  background: z.string().optional(),
  coaIssuer: z.string().optional(),
  howDidYouHear: z.string().optional(),
  files: z.array(ConsignFileSchema).optional(),
  status: z.literal("draft"),
  timestamp: z.number(),
});

export type ConsignSubmission = z.infer<typeof ConsignSubmissionSchema>;
export type ConsignDraft = z.infer<typeof ConsignDraftSchema>;
export type ConsignFile = z.infer<typeof ConsignFileSchema>;

