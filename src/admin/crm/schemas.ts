import { z } from "zod";

/** CRM entity schemas for form validation (aligned with API route validation) */

export const CustomerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  created_by: z.string().uuid().optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const CustomerUpdateSchema = CustomerSchema.partial();

export const LeadSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(["new", "contacted", "qualified", "unqualified"]).optional().default("new"),
  score: z.number().int().optional().default(0),
  last_contacted_at: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  converted_customer_id: z.string().uuid().optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const LeadUpdateSchema = LeadSchema.partial();

export const PipelineStageSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().min(1).optional().default(1),
  color: z.string().optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

export const PipelineStageUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().min(1).optional(),
  color: z.string().optional().nullable(),
  is_default: z.boolean().optional(),
});

export const DealSchema = z.object({
  title: z.string().min(1),
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  pipeline_stage_id: z.string().uuid().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().default("USD"),
  probability: z.number().int().min(0).max(100).optional().default(0),
  expected_close_date: z.string().optional().nullable(),
  status: z.enum(["open", "won", "lost"]).optional().default("open"),
  closed_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const DealUpdateSchema = DealSchema.partial().extend({
  currency: z.string().optional(),
});

export const MessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1),
  status: z.enum(["new", "open", "pending", "closed"]).optional().default("new"),
  source: z.string().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const MessageUpdateSchema = MessageSchema.partial();

export const AttachmentSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  content_type: z.string().optional().nullable(),
  size_bytes: z.number().int().optional().nullable(),
  uploaded_by: z.string().uuid().optional().nullable(),
});

export const AttachmentUpdateSchema = AttachmentSchema.partial();
