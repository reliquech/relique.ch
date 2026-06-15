"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ImageLightboxImage = {
  src: string;
  alt: string;
};

type ImageLightboxProps = {
  images: ImageLightboxImage[];
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ImageLightbox({
  images,
  activeIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const hasMultiple = images.length > 1;
  const safeIndex = images.length > 0 ? Math.min(Math.max(activeIndex, 0), images.length - 1) : 0;
  const current = images[safeIndex];

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    onIndexChange((safeIndex - 1 + images.length) % images.length);
  }, [images.length, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    onIndexChange((safeIndex + 1) % images.length);
  }, [images.length, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("overflow-hidden");
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleFocusTrap);
    return () => window.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  if (!isOpen || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="relative flex w-full max-w-5xl flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-4 text-white">
          <p className="text-sm font-medium tabular-nums" aria-live="polite">
            {safeIndex + 1} / {images.length}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex w-full items-center justify-center">
          {hasMultiple ? (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 z-10 flex h-10 w-10 -translate-x-2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:-translate-x-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          { }
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[70vh] w-full object-contain"
            draggable={false}
          />

          {hasMultiple ? (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 z-10 flex h-10 w-10 translate-x-2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:translate-x-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
