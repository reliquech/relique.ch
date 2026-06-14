import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  image: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  overlay?: boolean;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function MediaCard({
  image,
  imageAlt,
  title,
  description,
  overlay = false,
  cta,
  className,
}: MediaCardProps) {
  return (
    <div className={cn("relative group overflow-hidden", className)}>
      <div className="relative w-full h-full min-h-[300px]">
        <Image
          src={image}
          alt={imageAlt || title || ""}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(overlay || title || description || cta) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
            {title && (
              <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            )}
            {description && (
              <p className="text-white/90 mb-4 line-clamp-2">{description}</p>
            )}
            {cta && (
              <Button asChild variant="secondary" size="sm">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

