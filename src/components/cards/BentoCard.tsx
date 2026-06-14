import { Media } from "@/components/shared/Media";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  image?: string;
  imageAlt?: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function BentoCard({
  image,
  imageAlt,
  title,
  description,
  cta,
  className,
}: BentoCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {image && (
        <Media
          src={image}
          alt={imageAlt || title}
          variant="card"
          fill
        />
      )}
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
      </CardHeader>
      {cta && (
        <CardFooter className="p-4 sm:p-6 pt-0">
          <Button asChild variant="outline" className="w-full text-xs sm:text-sm">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

