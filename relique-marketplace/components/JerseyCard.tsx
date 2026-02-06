
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Jersey } from '../types';

interface JerseyCardProps {
  jersey: Jersey;
  onClick: (jersey: Jersey) => void;
}

const JerseyCard: React.FC<JerseyCardProps> = ({ jersey, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallbacks
  const title = jersey.title || 'UNTITLED JERSEY';
  const player = jersey.player || 'TEAM-ISSUED';
  const season = jersey.season || 'SEASON N/A';
  const size = jersey.size || 'N/A';
  const condition = jersey.condition || 'UNSPECIFIED';
  const backImage = jersey.backImage;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
      className="group bg-relique-card border border-white/10 flex flex-col cursor-pointer relative overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(jersey)}
    >
      {/* Minimalist Image Container 1:1 */}
      <div className="aspect-square relative overflow-hidden bg-white/5 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isHovered || !backImage ? (
            <motion.img
              key="front"
              src={jersey.frontImage}
              alt={title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <motion.img
              key="back"
              src={backImage}
              alt={`${title} back`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Info Block */}
      <div className="p-6 flex flex-col gap-4 flex-grow">
        <div className="space-y-2">
          <h3 className="text-base font-bold tracking-tight text-white group-hover:text-relique-accent transition-colors line-clamp-2 min-h-[48px]">
            {title}
          </h3>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
            {jersey.team} • {player} • {season}
          </p>
        </div>

        <div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <p className="text-xl font-black text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(jersey.price)}
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-[10px] font-bold text-white/30">{jersey.watchCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border border-white/5 text-white/30">SIZE {size}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border border-white/5 text-white/30">{condition}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JerseyCard;
