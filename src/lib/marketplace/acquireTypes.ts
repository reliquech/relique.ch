export interface AcquireInterest {
  marketplace_item_id: string;
  listing_slug: string;
  listing_title: string;
  created_at: string;
}

export interface AcquireInquiryResponse {
  id: string;
  lead_id: string;
  already_registered: boolean;
  interests: AcquireInterest[];
}

export type AcquirePhase = "idle" | "ready" | "form" | "submitting" | "success";
