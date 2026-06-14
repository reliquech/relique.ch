"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { marketplaceService } from "@/lib/services/marketplaceService";

interface FavoriteButtonProps {
  itemId: string;
  className?: string;
}

export function FavoriteButton({ itemId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = await marketplaceService.getFavorites();
        setIsFavorite(favorites.includes(itemId));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };
    
    loadFavorites();
  }, [itemId]);

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      await marketplaceService.toggleFavorite(itemId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={cn("h-8 w-8", className)}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isFavorite && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
}
