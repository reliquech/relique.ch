export interface AboutCard {
  title: string;
  sub: string;
  href: string;
  size: string;
  bg: string;
  highlight?: boolean;
}

export const ABOUT_CARDS: AboutCard[] = [
  {
    title: "Mission & Vision",
    sub: "Everything you need to know about our story from capital to collectible markets.",
    href: "/about#who-we-are",
    size: "col-span-12 md:col-span-6",
    bg: "bg-navy/40",
  },
  {
    title: "Investment Vehicle",
    sub: "One to appreciate, but also one that appreciates.",
    href: "/about#investment-vehicle",
    size: "col-span-12 md:col-span-6",
    bg: "bg-primaryBlue/20",
  },
  {
    title: "A Question of Trust",
    sub: "And an AI-powered answer.",
    href: "/about#question-of-trust",
    size: "col-span-12",
    bg: "bg-cardDark",
    highlight: true,
  },
];
