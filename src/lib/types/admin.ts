export enum SubmissionStatus {
  NEW = 'new',
  IN_REVIEW = 'in_review',
  CLOSED = 'closed'
}

export enum VerificationStatus {
  QUALIFIED = 'qualified',
  INCONCLUSIVE = 'inconclusive',
  DISQUALIFIED = 'disqualified'
}

export enum MarketplaceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface MarketplaceItem {
  id: string;
  slug?: string;
  title: string;
  athlete: string;
  category: string;
  status: MarketplaceStatus;
  is_featured: boolean;
  price_usd: number;
  updated_at?: string;
  cover_image_url?: string;
  featured_order?: number | null;
}

export interface Submission {
  id: string;
  type: 'authenticate' | 'consign' | 'contact';
  sender: string;
  email: string;
  status: SubmissionStatus;
  created_at: string;
  details: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}

/** Audit log row from API (matches DB audit_logs) */
export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardSummary {
  new_customers: number;
  new_leads: number;
  new_messages: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  pipeline_value: number;
  pipeline_open_value: number;
}

export interface DashboardSeriesItem {
  date: string;
  new_leads: number;
  new_deals: number;
  new_messages: number;
}

export interface DashboardFunnelSummary {
  leads_created: number;
  deals_created: number;
  deals_won: number;
}

export interface LeadSourcePerformance {
  source: string;
  lead_count: number;
  converted_count: number;
}

export interface DealAgingBucket {
  bucket: string;
  deal_count: number;
  total_value: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at: string;
}

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  entity_type?: "lead" | "deal" | "message" | null;
  condition_type:
    | "lead_stale"
    | "lead_status"
    | "lead_score_min"
    | "lead_score_max"
    | "lead_source"
    | "deal_stale"
    | "deal_status"
    | "deal_value_min"
    | "deal_value_max"
    | "message_unread"
    | "message_status"
    | "message_source";
  condition_params?: Record<string, unknown> | null;
  conditions?: Array<{ type: string; params?: Record<string, unknown> | null }> | null;
  action_type: "create_notification" | "create_task";
  action_params?: Record<string, unknown> | null;
  enabled: boolean;
  last_triggered_at?: string | null;
  cooldown_hours?: number | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  type_preferences?: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

export interface VerifyRecord {
  id: string;
  pid: string;
  name: string;
  signatures: number;
  result: VerificationStatus;
  date: string;
}

// CRM entities (match DB / API)

export interface Customer {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  status: string;
  created_by?: string | null;
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  status: string;
  score?: number;
  last_contacted_at?: string | null;
  owner_id?: string | null;
  converted_customer_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  customer_id?: string | null;
  lead_id?: string | null;
  value?: number | null;
  currency: string;
  probability?: number;
  expected_close_date?: string | null;
  status: string;
  closed_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  source?: string | null;
  customer_id?: string | null;
  lead_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "open" | "done";
  priority: "low" | "medium" | "high";
  due_at?: string | null;
  entity_type?: "lead" | "deal" | "message" | "customer" | null;
  entity_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  source_rule_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  file_path: string;
  file_name: string;
  content_type?: string | null;
  size_bytes?: number | null;
  uploaded_by?: string | null;
  title?: string | null;
  note?: string | null;
  created_at: string;
}

/** Paginated list response from CRM list endpoints */
export interface PaginatedListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
