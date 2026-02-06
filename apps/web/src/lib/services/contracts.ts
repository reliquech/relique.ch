import type {
  MarketplaceListing,
  MarketplaceFilters,
  PaginationParams,
  SortOption,
} from "@/lib/schemas/marketplace";
import type {
  VerifyResult,
  VerifyHistoryEntry,
  VerifyRunInput,
} from "@/lib/schemas/verify";

export type { VerifyResult, VerifyHistoryEntry, VerifyRunInput };
import type {
  ConsignSubmission,
  ConsignDraft,
  SubmissionStatus,
} from "@/lib/schemas/consign";
import type { Post, Event } from "@/lib/schemas/content";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface MarketplaceListParams {
  q?: string;
  filters?: MarketplaceFilters;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface MarketplaceListResponse {
  items: MarketplaceListing[];
  pageInfo: PaginatedResponse<MarketplaceListing>;
}

export interface IMarketplaceService {
  list(params?: MarketplaceListParams): Promise<MarketplaceListResponse>;
  getBySlug(slug: string): Promise<MarketplaceListing | null>;
  toggleFavorite(id: string): Promise<string[]>;
  getFavorites(): Promise<string[]>;
}

export interface IVerifyService {
  run(input: VerifyRunInput): Promise<VerifyResult>;
  history: {
    list(): Promise<VerifyHistoryEntry[]>;
    add(result: VerifyResult): Promise<void>;
    clear(): Promise<void>;
  };
}

export interface IConsignService {
  drafts: {
    list(): Promise<ConsignDraft[]>;
    save(draft: Partial<ConsignDraft>): Promise<ConsignDraft>;
    remove(id: string): Promise<void>;
    get(id: string): Promise<ConsignDraft | null>;
  };
  submitMock(draftId?: string): Promise<{ submissionId: string; status: SubmissionStatus }>;
  list(status?: SubmissionStatus): Promise<ConsignSubmission[]>;
  get(id: string): Promise<ConsignSubmission | null>;
}

export interface ContentListParams {
  featured?: boolean;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface IContentService {
  posts: {
    list(params?: ContentListParams): Promise<Post[]>;
    get(slug: string): Promise<Post | null>;
  };
  events: {
    list(upcoming?: boolean): Promise<Event[]>;
    get(slug: string): Promise<Event | null>;
  };
}

export interface IAdminMarketplaceService extends IMarketplaceService {
  create(
    listing: Omit<MarketplaceListing, "id" | "slug">
  ): Promise<MarketplaceListing>;
  update(id: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing | null>;
  delete(id: string): Promise<boolean>;
  bulkUpdate(ids: string[], updates: Partial<MarketplaceListing>): Promise<number>;
  bulkDelete(ids: string[]): Promise<number>;
}

export interface IAdminContentService extends IContentService {
  posts: IContentService["posts"] & {
    create(post: Omit<Post, "id" | "slug" | "createdAt" | "updatedAt">): Promise<Post>;
    update(id: string, updates: Partial<Post>): Promise<Post | null>;
    delete(id: string): Promise<boolean>;
  };
  events: IContentService["events"] & {
    create(event: Omit<Event, "id" | "slug" | "createdAt" | "updatedAt">): Promise<Event>;
    update(id: string, updates: Partial<Event>): Promise<Event | null>;
    delete(id: string): Promise<boolean>;
  };
}
