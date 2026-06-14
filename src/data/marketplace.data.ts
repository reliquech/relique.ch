export enum Status {
  QUALIFIED = "Qualified",
  INCONCLUSIVE = "Inconclusive",
  DISQUALIFIED = "Disqualified",
}

export interface MarketplaceItem {
  id: string;
  name: string;
  athlete: string;
  year: string;
  category: string;
  image: string;
  status: Status;
}

export const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: "1",
    name: "Championship Jersey",
    athlete: "Michael Jordan",
    year: "1998",
    category: "Basketball",
    status: Status.QUALIFIED,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    name: "Match Worn Boots",
    athlete: "Lionel Messi",
    year: "2022",
    category: "Football",
    status: Status.QUALIFIED,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    name: "Signed Baseball",
    athlete: "Shohei Ohtani",
    year: "2023",
    category: "Baseball",
    status: Status.INCONCLUSIVE,
    image: "https://images.unsplash.com/photo-1516731415730-0c607149933a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    name: "Race Helmet",
    athlete: "Lewis Hamilton",
    year: "2021",
    category: "F1",
    status: Status.QUALIFIED,
    image: "https://picsum.photos/800/800?random=market4",
  },
  {
    id: "5",
    name: "Grand Slam Racket",
    athlete: "Roger Federer",
    year: "2017",
    category: "Tennis",
    status: Status.QUALIFIED,
    image: "https://picsum.photos/800/800?random=market5",
  },
  {
    id: "6",
    name: "Limited Edition Bat",
    athlete: "Virat Kohli",
    year: "2019",
    category: "Cricket",
    status: Status.QUALIFIED,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800",
  },
];

/**
 * Get Tailwind classes for status badge based on status value
 */
export function getStatusColor(status: Status): string {
  switch (status) {
    case Status.QUALIFIED:
      return "text-green-400 bg-green-400/10";
    case Status.INCONCLUSIVE:
      return "text-amber-400 bg-amber-400/10";
    case Status.DISQUALIFIED:
      return "text-red-400 bg-red-400/10";
  }
}

/**
 * Get complete badge classes including common styles
 */
export function getStatusBadgeClasses(status: Status): string {
  const colorClasses = getStatusColor(status);
  return `px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl ${colorClasses}`;
}
