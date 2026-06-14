import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/interactive/FavoriteButton";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import {
  getListingAuthStatus,
  getListingCategory,
  getListingHeroImage,
  getListingPriceAmount,
  getListingSignedBy,
  getListingTitle,
  getListingShortDescription,
} from "@/lib/utils/marketplace";

interface FeaturedItemCardProps {
  item: MarketplaceListing;
  className?: string;
}

/**
 * Featured item card - uses shadcn Card components
 * Used in featured items section on home page
 */
export function FeaturedItemCard({ item, className }: FeaturedItemCardProps) {
  const getStatusBadge = () => {
    const status = getListingAuthStatus(item);
    if (status === "verified") {
      return <Badge className="bg-green-600 text-white border-0">Verified</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-yellow-600 text-white border-0">Pending</Badge>;
    }
    if (status === "rejected") {
      return <Badge className="bg-red-600 text-white border-0">Rejected</Badge>;
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-all duration-200",
        "hover:border-accent hover:ring-2 hover:ring-accent hover:ring-offset-2",
        "rounded-none border-border",
        className
      )}
    >
      <Link href={`/marketplace/${item.slug}`} className="flex-1 flex flex-col">
        <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-none overflow-hidden">
          <Image
            src={getListingHeroImage(item)}
            alt={getListingTitle(item)}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
            <FavoriteButton itemId={item.id} />
          </div>
          {getStatusBadge() && (
            <div className="absolute top-2 left-2">
              {getStatusBadge()}
            </div>
          )}
        </div>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">{getListingTitle(item)}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{getListingCategory(item)}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 sm:p-6 pt-0">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {getListingShortDescription(item)}
          </p>
          {getListingSignedBy(item) && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
              Signed by: {getListingSignedBy(item)}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 sm:p-6">
          <span className="text-lg sm:text-xl font-bold">${getListingPriceAmount(item).toLocaleString()}</span>
        </CardFooter>
      </Link>
    </Card>
  );
}
