import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaStripProps {
  title?: string;
  items: Array<{
    image: string;
    alt: string;
    href?: string;
  }>;
  className?: string;
}

export function MediaStrip({ title, items, className }: MediaStripProps) {
  if (items.length === 0) return null;

  return (
    <section className={cn("space-y-6", className)}>
      {title && <h2 className="text-h3 text-center">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative w-full h-24 border bg-muted/50 flex items-center justify-center",
              item.href && "hover:bg-muted transition-colors cursor-pointer"
            )}
          >
            {item.href ? (
              <a href={item.href} className="relative w-full h-full">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-contain p-2"
                />
              </a>
            ) : (
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-contain p-2"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

