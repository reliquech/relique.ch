import { cn } from "@/lib/utils";

interface ContentSectionProps {
  heading: string;
  body: string | React.ReactNode;
  anchorId?: string;
  className?: string;
}

export function ContentSection({
  heading,
  body,
  anchorId,
  className,
}: ContentSectionProps) {
  return (
    <section id={anchorId} className={cn("space-y-4", className)}>
      <h2 className="text-h3">{heading}</h2>
      {typeof body === "string" ? (
        <p className="text-body text-muted-foreground">{body}</p>
      ) : (
        <div className="text-body text-muted-foreground">{body}</div>
      )}
    </section>
  );
}

