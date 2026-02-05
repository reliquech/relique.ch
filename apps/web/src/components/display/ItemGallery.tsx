"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ItemGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/** Ảnh từ URL (Supabase): dùng <img> để luôn hiển thị, tránh Next/Image chặn domain */
function GalleryImage({
  src,
  alt,
  fillClassName,
}: {
  src: string;
  alt: string;
  fillClassName: string;
}) {
  if (src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={alt}
        className={fillClassName}
        draggable={false}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={fillClassName}
      draggable={false}
    />
  );
}

export function ItemGallery({ images, alt, className }: ItemGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (images.length === 0) return null;

  const currentSrc = images[selectedIndex];

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <div
          className="relative w-full h-96 border bg-muted cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
        >
          {currentSrc && (
            <GalleryImage
              src={currentSrc}
              alt={`${alt} - Image ${selectedIndex + 1}`}
              fillClassName="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative w-full h-20 border bg-muted transition-opacity",
                  selectedIndex === index
                    ? "opacity-100 border-primary"
                    : "opacity-60 hover:opacity-80"
                )}
              >
                <GalleryImage
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fillClassName="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 bg-black border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            <div className="relative w-full h-full">
              {currentSrc && (
                <GalleryImage
                  src={currentSrc}
                  alt={`${alt} - Image ${selectedIndex + 1}`}
                  fillClassName="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </div>

            {/* Thumbnails at bottom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "relative w-16 h-16 border-2 bg-muted transition-all",
                      selectedIndex === index
                        ? "border-white opacity-100"
                        : "border-transparent opacity-60 hover:opacity-80"
                    )}
                  >
                    <GalleryImage
                      src={image}
                      alt={`${alt} thumbnail ${index + 1}`}
                      fillClassName="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
