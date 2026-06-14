import { TestimonialCard } from "@/components/cards/TestimonialCard";
import type { Testimonial } from "@/data/testimonials.data";

interface TestimonialsGridProps {
  testimonials: Testimonial[];
}

/**
 * Grid layout for testimonials
 * Wraps testimonial cards in responsive grid
 */
export function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {testimonials.map((testimonial, idx) => (
        <TestimonialCard 
          key={testimonial.name} 
          testimonial={testimonial} 
          index={idx} 
        />
      ))}
    </div>
  );
}
