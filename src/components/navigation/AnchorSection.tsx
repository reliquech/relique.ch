import { ReactNode } from "react";

interface AnchorSectionProps {
  id: string;
  heading: string;
  children: ReactNode;
  className?: string;
}

export function AnchorSection({ id, heading, children, className }: AnchorSectionProps) {
  return (
    <section id={id} className={className}>
      <h2 className="text-h2 mb-6">{heading}</h2>
      <div className="prose-content">{children}</div>
    </section>
  );
}

