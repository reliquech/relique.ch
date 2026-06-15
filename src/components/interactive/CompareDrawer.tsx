"use client";

import { useState, useEffect, useCallback, createContext, useContext, Fragment } from "react";
import Link from "next/link";
import { RemoteImage } from "@/components/shared/RemoteImage";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, X, Plus, Check, Trash2 } from "lucide-react";
import type { MarketplaceListing } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  getListingAuthStatus,
  getListingCategory,
  getListingCoaRef,
  getListingHeroImage,
  getListingPriceAmount,
  getListingSignedBy,
  getListingTitle,
} from "@/lib/utils/marketplace";

const COMPARE_STORAGE_KEY = "relique.v1.marketplace.compare";
const MAX_COMPARE_ITEMS = 3;

interface CompareContextType {
  compareItems: MarketplaceListing[];
  addToCompare: (item: MarketplaceListing) => void;
  removeFromCompare: (itemId: string) => void;
  clearCompare: () => void;
  isInCompare: (itemId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (stored) {
      try {
        setCompareItems(JSON.parse(stored));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = useCallback((item: MarketplaceListing) => {
    setCompareItems((prev) => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromCompare = useCallback((itemId: string) => {
    setCompareItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback(
    (itemId: string) => compareItems.some((i) => i.id === itemId),
    [compareItems]
  );

  return (
    <CompareContext.Provider
      value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

interface CompareButtonProps {
  item: MarketplaceListing;
  variant?: "icon" | "button";
}

export function CompareButton({ item, variant = "icon" }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, compareItems } = useCompare();
  const inCompare = isInCompare(item.id);
  const isFull = compareItems.length >= MAX_COMPARE_ITEMS;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(item.id);
    } else if (!isFull) {
      addToCompare(item);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant={inCompare ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={!inCompare && isFull}
      >
        {inCompare ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            In Compare
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Compare
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={!inCompare && isFull}
      className={cn(
        "h-8 w-8",
        inCompare && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      <Scale className="w-4 h-4" />
    </Button>
  );
}

export function CompareDrawer() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [open, setOpen] = useState(false);

  if (compareItems.length === 0) return null;

  const compareFields = [
    { label: "Price", getValue: (item: MarketplaceListing) => `$${getListingPriceAmount(item).toLocaleString()}` },
    { label: "Category", getValue: (item: MarketplaceListing) => getListingCategory(item) || "—" },
    { label: "Signed By", getValue: (item: MarketplaceListing) => getListingSignedBy(item) || "—" },
    { label: "COA Ref", getValue: (item: MarketplaceListing) => getListingCoaRef(item) || "—" },
    { label: "Status", getValue: (item: MarketplaceListing) => getListingAuthStatus(item) || "—" },
    { label: "Verified", getValue: (item: MarketplaceListing) => (getListingAuthStatus(item) === "verified" ? "Yes" : "No") },
  ] as const;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <Scale className="w-5 h-5 mr-2" />
              Compare ({compareItems.length}/{MAX_COMPARE_ITEMS})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Compare Items
                <Button variant="ghost" size="sm" onClick={clearCompare}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </SheetTitle>
              <SheetDescription>
                Compare up to {MAX_COMPARE_ITEMS} items side by side
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 overflow-x-auto">
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}
              >
                <div />
                {compareItems.map((item) => (
                  <Card key={item.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-6 w-6"
                      onClick={() => removeFromCompare(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <CardContent className="p-4">
                      <div className="relative aspect-square mb-3">
                        <RemoteImage
                          src={getListingHeroImage(item)}
                          alt={getListingTitle(item)}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <Link
                        href={`/marketplace/${item.slug}`}
                        className="font-medium hover:underline line-clamp-2"
                      >
                        {getListingTitle(item)}
                      </Link>
                    </CardContent>
                  </Card>
                ))}

                {compareFields.map((field) => (
                  <Fragment key={field.label}>
                    <div
                      className="flex items-center font-medium text-muted-foreground py-2 border-t"
                    >
                      {field.label}
                    </div>
                    {compareItems.map((item) => {
                      const value = field.getValue(item);
                      const isVerifiedRow = field.label === "Verified" && value === "Yes";
                      return (
                        <div
                          key={`${item.id}-${field.label}`}
                          className="flex items-center py-2 border-t"
                        >
                          {isVerifiedRow ? (
                            <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                              Verified
                            </Badge>
                          ) : (
                            <span>{String(value)}</span>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
