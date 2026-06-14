import { z } from "zod";

export const consignSchema = z.object({
  // Your Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  // Item Details
  itemDescription: z.string().min(10, "Item description must be at least 10 characters"),
  category: z.string().optional(),
  // Signature Information
  signedBy: z.string().optional(),
  numberOfSignatures: z.number().int().min(0).optional(),
  // Estimated Value
  estimatedValue: z.number().min(0, "Estimated value must be positive").optional(),
  // Provenance & Background
  provenance: z.string().optional(),
  background: z.string().optional(),
  // Additional Information
  coaIssuer: z.string().optional(),
  howDidYouHear: z.string().optional(),
  // Terms
  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ConsignFormData = z.infer<typeof consignSchema>;

