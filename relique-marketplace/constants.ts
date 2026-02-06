
import { Jersey, JerseyCategory, VerificationStatus } from './types';

export const COLORS = {
  bg: '#0A0A0A',
  card: '#121212',
  border: '#333333',
  navy: '#0F2854',
  primary: '#1C4D8D',
  accent: '#498BC4',
  ice: '#BDE8F5',
  status: {
    qualified: '#22C55E',
    inconclusive: '#F59E0B',
    disqualified: '#EF4444'
  }
};

export const MOCK_JERSEYS: Jersey[] = [
  {
    id: '1',
    slug: 'messi-barcelona-15-16',
    title: 'FC Barcelona 2015/16 Home',
    category: JerseyCategory.MATCH_WORN,
    team: 'FC Barcelona',
    player: 'Lionel Messi',
    season: '2015-2016',
    condition: 'Match Worn Grade A',
    size: 'L',
    verificationStatus: VerificationStatus.QUALIFIED,
    coa: {
      included: true,
      issuer: 'FCB Authentics',
      certificate_id: 'FCB-LM10-9942',
      issue_date: '2016-05-12',
      documents: [{ name: 'Letter of Authenticity', url: '#' }]
    },
    match: {
      name: 'La Liga: FC Barcelona vs Real Madrid',
      date: 'April 2, 2016',
      venue: 'Camp Nou',
      competition: 'La Liga',
      opponent: 'Real Madrid',
      score: '1-2',
      minute_context: 'Full Match'
    },
    provenance: {
      narrative: 'This jersey was worn by Lionel Messi during the 231st El Clásico. It was acquired directly from the kit manager following the match at Camp Nou. The piece has remained in a private climate-controlled collection since its acquisition.',
      chain_of_ownership: ['Kit Manager (FCB)', 'Private Collector (Europe)', 'Relique Archive'],
      acquisition_method: 'Private Treaty'
    },
    authenticity: {
      methodology_summary: 'Multi-point visual inspection compared against high-resolution match photography and internal manufacturing specifications.',
      inspection_points: ['Heat-pressed Nike logo matching player-spec', 'Specific wash tag code verification', 'Signature alignment analysis', 'Fabric weave density check'],
      report_id: 'RLQ-AUTH-00124',
      last_updated: '2024-01-15'
    },
    timeline: [
      { date: '2023-12-01', event: 'Listed on Marketplace', type: 'listing' },
      { date: '2023-12-15', event: 'Physical Verification Initiated', type: 'review' },
      { date: '2024-01-15', event: 'Verification Status: Qualified', type: 'verification' }
    ],
    price: 12500,
    frontImage: 'https://images.unsplash.com/photo-1522778147829-047360bdc7f6?auto=format&fit=crop&q=80&w=800',
    backImage: 'https://images.unsplash.com/photo-1518005020951-ecc8a8345021?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'
    ],
    video_proof: [
      { url: '#', title: 'Kit Room Handover', source: 'Internal Footage', timestamp: 'Post-Match' }
    ],
    watchCount: 124,
    likeCount: 89
  },
  {
    id: '5',
    slug: 'rashford-training-23-24',
    title: '', // Missing title fallback
    category: JerseyCategory.TRAINING_ISSUE,
    team: 'Manchester United',
    player: 'Marcus Rashford',
    season: '2023-2024',
    condition: 'New with Tags',
    size: 'M',
    verificationStatus: VerificationStatus.DISQUALIFIED,
    price: 350,
    frontImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=800',
    watchCount: 12,
    likeCount: 5
    // Missing match, provenance, authenticity, timeline, coa
  }
];

export const CATEGORIES = Object.values(JerseyCategory);
export const TEAMS = Array.from(new Set(MOCK_JERSEYS.map(j => j.team || 'Unknown')));
export const VERIFICATION_STATUSES = Object.values(VerificationStatus);
