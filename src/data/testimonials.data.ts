export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  verified: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jonathan Reeves",
    role: "Private Collector",
    quote: "The AI forensic score gave me the confidence to acquire a piece I've been tracking for years. Relique's standard is unmatched.",
    rating: 5,
    verified: true,
  },
  {
    name: "Elena Petrov",
    role: "Sports Historian",
    quote: "Finally, a platform that treats sports memorabilia with the same academic and financial rigor as fine art.",
    rating: 5,
    verified: true,
  },
  {
    name: "Marcus Thorne",
    role: "Asset Manager",
    quote: "Integrating Relique's authenticated items into my client's alternative portfolio was seamless. Pure transparency.",
    rating: 5,
    verified: true,
  },
];
