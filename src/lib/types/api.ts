import type {
  MarketplaceListing,
  Post,
  Event,
  ConsignSubmission,
} from "../types";

export type { MarketplaceListing, Post, Event, ConsignSubmission };

export interface VerifyResult {
  productId: string;
  itemName: string;
  signatures: number;
  status: "qualified" | "inconclusive" | "disqualified";
  date: string;
  certificate: string;
  authenticationResult: string;
  dateOfAnalysis: string;
}

export interface UserSession {
  userEmail: string;
  userName: string;
  loginMethod: "email" | "magic-link" | "social";
  createdAt: string;
}

export interface ConsignDraft {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  itemDescription?: string;
  category?: string;
  estimatedValue?: number;
  coaIssuer?: string;
  howDidYouHear?: string;
  files?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  status: "draft";
  timestamp: number;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedAPIResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
}

