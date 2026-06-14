"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PressArticle } from "@/data/press.data";

const FALLBACK_IMAGE = "/mock-images/consign.jpg";

// --- Interfaces ---
export interface PressCoverageSectionProps {
  items: PressArticle[];
  eyebrow?: string;
  title?: string;
}

interface ArticleMeta {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  readingTime: string | null;
  publisher: string | null;
}

// --- Hooks ---
function useArticleMeta(items: PressArticle[]) {
  const [metadata, setMetadata] = useState<Record<string, ArticleMeta>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      // Reset loading khi items đổi (nếu cần thiết logic reload)
      setLoading(true);
      const results: Record<string, ArticleMeta> = {};
      
      await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(`/api/article-meta?url=${encodeURIComponent(item.href)}`);
            const data = await res.json();
            if (!data.error) results[item.href] = data;
          } catch {
            // Silent fail
          }
        })
      );
      
      setMetadata(results);
      setLoading(false);
    };

    fetchMetadata();
  }, [items]);

  return { metadata, loading };
}

function formatDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return null; }
}

// --- Skeleton Component ---
const SkeletonText = ({ className }: { className?: string }) => (
  <div className={`bg-white/10 animate-pulse rounded ${className}`} />
);

// --- Main Component ---
export function PressCoverageSection({
  items,
  eyebrow = "Editorial Insights",
  title = "Featured Stories",
}: PressCoverageSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { metadata, loading } = useArticleMeta(items);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, items.length]);

  const currentArticle = items[currentIndex];
  if (!currentArticle) return null;

  // Xử lý dữ liệu hiển thị
  const meta = metadata[currentArticle.href];
  
  // Logic check: Đang tải global HOẶC chưa có data cho bài viết cụ thể này
  const isLoading = loading || !meta;

  const displayImage = meta?.imageUrl || FALLBACK_IMAGE;
  const displayTitle = meta?.title || "Untitled Article";
  const displayDesc = meta?.description;
  const displayDate = formatDate(meta?.publishedAt);
  const displayPublisher = meta?.publisher || "Press Coverage";
  const displayReadTime = meta?.readingTime;

  return (
    <section className="py-20 lg:py-24 bg-bgDark border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primaryBlue/5 -skew-x-12 translate-x-1/2 pointer-events-none hidden lg:block" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 lg:mb-12"
        >
          <span className="text-primaryBlue font-semibold uppercase text-xs tracking-wider mb-3 block">
            {eyebrow}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
            {title}
          </h2>
        </motion.div>

        {/* Main Card */}
        <div 
          className="bg-cardDark border border-white/10 shadow-2xl overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-[500px]">
            
            {/* 1. IMAGE COLUMN */}
            <div className="relative h-[300px] lg:h-auto overflow-hidden bg-black border-b lg:border-b-0 lg:border-r border-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentArticle.href}
                  className="absolute inset-0"
                  initial={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 1.05, opacity: 0, filter: "blur(5px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Image
                    src={displayImage}
                    alt={displayTitle}
                    fill
                    unoptimized={displayImage.startsWith("http")}
                    className="object-cover opacity-90 transition-transform duration-[8000ms] ease-linear group-hover:scale-110"
                  />
                  {/* Gradient Overlay để text dễ đọc hơn nếu cần */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bgDark/60 via-transparent to-transparent opacity-60" />
                </motion.div>
              </AnimatePresence>

              {/* Publisher Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="px-3 py-1.5 bg-bgDark/80 backdrop-blur-md border border-white/10 rounded-sm">
                  {isLoading ? (
                     <SkeletonText className="w-20 h-3" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {displayPublisher}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CONTENT COLUMN */}
            <div className="flex flex-col relative bg-bgDark">
              <div className="flex-grow p-8 lg:p-12 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Featured Label */}
                    {currentArticle.tone === "featured" && (
                      <span className="inline-block px-2 py-1 bg-primaryBlue text-white text-[10px] font-bold uppercase tracking-wide rounded-sm">
                        Featured
                      </span>
                    )}

                    {/* TITLE AREA: Text or Skeleton */}
                    <div className="min-h-[80px] lg:min-h-[100px]"> 
                      {isLoading ? (
                        <div className="space-y-3">
                          <SkeletonText className="h-8 w-full" />
                          <SkeletonText className="h-8 w-3/4" />
                          <SkeletonText className="h-8 w-1/2" />
                        </div>
                      ) : (
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-white group-hover:text-primaryBlue transition-colors duration-300">
                          {displayTitle}
                        </h3>
                      )}
                    </div>

                    {/* DESCRIPTION AREA: Text or Skeleton */}
                    <div className="min-h-[72px]">
                      {isLoading ? (
                        <div className="space-y-2 mt-4">
                          <SkeletonText className="h-4 w-full" />
                          <SkeletonText className="h-4 w-5/6" />
                          <SkeletonText className="h-4 w-4/6" />
                        </div>
                      ) : (
                        displayDesc && (
                          <p className="text-white/60 text-base leading-relaxed line-clamp-3">
                            {displayDesc}
                          </p>
                        )
                      )}
                    </div>

                    {/* Call to Action */}
                    <div className="pt-4">
                      <Link
                        href={currentArticle.href}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-primaryBlue font-medium text-sm hover:text-white transition-colors group/link"
                      >
                        Read Full Article
                        <span className="transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* FOOTER INFO & NAV */}
              <div className="mt-auto border-t border-white/10 flex flex-col sm:flex-row h-auto sm:h-20 bg-cardDark/50">
                
                {/* Meta Info Grid */}
                <div className="flex-grow grid grid-cols-2 border-b sm:border-b-0 sm:border-r border-white/10">
                  <div className="p-4 sm:pl-12 flex flex-col justify-center border-r sm:border-r-0 border-white/10">
                    <span className="text-[10px] uppercase text-white/40 mb-1">Published</span>
                    {isLoading ? (
                      <SkeletonText className="h-4 w-24" />
                    ) : (
                      <span className="text-sm font-medium text-white">{displayDate || "N/A"}</span>
                    )}
                  </div>
                  <div className="p-4 sm:pl-8 flex flex-col justify-center">
                    <span className="text-[10px] uppercase text-white/40 mb-1">Read Time</span>
                     {isLoading ? (
                      <SkeletonText className="h-4 w-16" />
                    ) : (
                      <span className="text-sm font-medium text-white">{displayReadTime || "N/A"}</span>
                    )}
                  </div>
                </div>

                {/* Nav Controls */}
                <div className="flex shrink-0">
                  <div className="w-20 flex items-center justify-center border-r border-white/10 bg-bgDark">
                    <span className="text-sm font-medium text-white">
                      {String(currentIndex + 1).padStart(2, '0')}
                      <span className="text-white/30 mx-1">/</span>
                      <span className="text-white/30">{String(items.length).padStart(2, '0')}</span>
                    </span>
                  </div>
                  
                  <button 
                    onClick={prevSlide}
                    className="w-16 sm:w-20 bg-bgDark hover:bg-primaryBlue hover:text-white transition-all flex items-center justify-center border-r border-white/10 text-white/70"
                    aria-label="Previous"
                  >
                    <span className="text-xl">←</span>
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-16 sm:w-20 bg-bgDark hover:bg-primaryBlue hover:text-white transition-all flex items-center justify-center text-white/70"
                    aria-label="Next"
                  >
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}