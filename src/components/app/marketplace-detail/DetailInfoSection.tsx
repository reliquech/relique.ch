import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { DetailSpecGrid } from "@/components/app/marketplace-detail/DetailSpecGrid";
import type { DetailSpecRow } from "@/lib/utils/marketplaceDetail";

interface DetailInfoSectionProps {
  id: string;
  title: string;
  description?: string;
  rows?: DetailSpecRow[];
  children?: ReactNode;
  variants: Variants;
  reduceMotion: boolean;
}

export function DetailInfoSection({
  id,
  title,
  description,
  rows = [],
  children,
  variants,
  reduceMotion,
}: DetailInfoSectionProps) {
  const hasContent = Boolean(description) || rows.length > 0 || children;
  if (!hasContent) return null;

  return (
    <motion.section
      id={id}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className="pt-20 border-t border-white/5"
    >
      <h2 className="text-[10px] font-black uppercase tracking-[0.45em] text-white/45 mb-3">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-base md:text-lg leading-relaxed text-white/80 mb-10">
          {description}
        </p>
      ) : null}
      {rows.length > 0 ? <DetailSpecGrid rows={rows} /> : null}
      {children}
    </motion.section>
  );
}
