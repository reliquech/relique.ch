/**
 * Press Articles Data
 * Chỉ cần cung cấp URL - tất cả metadata sẽ được fetch tự động từ API
 */

export type PressTone = "neutral" | "featured";

export interface PressArticle {
  href: string;
  tone?: PressTone;
}

export const PRESS_ARTICLES: PressArticle[] = [
  {
    href: "https://www.cfainstitute.org/insights/articles/investing-in-sports-memorabilia",
    tone: "featured",
  },
  {
    href: "https://www.forbes.com/councils/forbesfinancecouncil/2024/11/22/the-called-shot-jersey-and-the-rise-of-sports-collectibles-as-high-value-investments/",
  },
  {
    href: "https://www.kiplinger.com/investing/sports-memorabilia-arrive-as-an-investing-class",
  },
];
