
export enum VerificationStatus {
  QUALIFIED = 'qualified',
  INCONCLUSIVE = 'inconclusive',
  DISQUALIFIED = 'disqualified'
}

export enum JerseyCategory {
  MATCH_WORN = 'Match Worn',
  SIGNED = 'Signed',
  TEAM_ISSUED = 'Team Issued',
  TRAINING_ISSUE = 'Training Issue',
  RETAIL = 'Retail'
}

export interface VideoProof {
  url: string;
  title: string;
  source: string;
  timestamp?: string;
}

export interface COA {
  included: boolean;
  issuer?: string;
  certificate_id?: string;
  issue_date?: string;
  documents?: { name: string; url: string }[];
}

export interface MatchContext {
  name: string;
  date: string;
  venue: string;
  competition: string;
  opponent: string;
  score: string;
  minute_context?: string;
}

export interface Provenance {
  narrative: string;
  source_notes?: string;
  chain_of_ownership?: string[];
  acquisition_method?: string;
}

export interface AuthenticityReport {
  methodology_summary: string;
  inspection_points: string[];
  photos_evidence?: string[];
  report_id: string;
  last_updated: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  type: 'listing' | 'review' | 'verification' | 'sale';
}

export interface Jersey {
  id: string;
  slug: string;
  title?: string;
  team?: string;
  player?: string;
  season?: string;
  category?: JerseyCategory;
  condition?: string;
  size?: string;
  verificationStatus?: VerificationStatus;
  coa?: COA;
  match?: MatchContext;
  provenance?: Provenance;
  authenticity?: AuthenticityReport;
  timeline?: TimelineEvent[];
  price: number;
  frontImage: string;
  backImage?: string;
  gallery?: string[];
  video_proof?: VideoProof[];
  watchCount: number;
  likeCount: number;
}

export interface FilterState {
  search: string;
  category: string[];
  team: string[];
  verification: VerificationStatus[];
  coaOnly: boolean;
  priceRange: [number, number];
  hasBackPhoto: boolean;
  hasVideo: boolean;
  sortBy: string;
}
