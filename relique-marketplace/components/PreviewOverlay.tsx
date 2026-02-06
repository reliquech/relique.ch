
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Jersey, VerificationStatus } from '../types';
import Badge from './Badge';

interface PreviewOverlayProps {
  jersey: Jersey;
  onClose: () => void;
  onViewDetails: (id: string) => void;
}

const PreviewOverlay: React.FC<PreviewOverlayProps> = ({ jersey, onClose, onViewDetails }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 60, rotateX: -10 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-relique-card border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,1)] perspective-1000 origin-center"
      >
        {/* Header row with close */}
        <div className="sticky top-0 z-10 bg-relique-card/80 border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Badge status={jersey.verificationStatus || VerificationStatus.INCONCLUSIVE} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Inspection Module // {jersey.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/30 hover:text-white transition-all hover:rotate-90 duration-300"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Section */}
          <div className="p-8 space-y-6 border-r border-white/5 bg-gradient-to-br from-relique-navy/10 to-transparent">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="aspect-square bg-white/5 relative border border-white/10 group overflow-hidden"
            >
               <img
                src={jersey.frontImage}
                alt={jersey.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </motion.div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="aspect-square bg-white/5 border border-relique-primary/40 cursor-pointer overflow-hidden opacity-100 transition-opacity hover:opacity-80">
                <img src={jersey.frontImage} className="w-full h-full object-cover" />
              </div>
              {jersey.backImage && (
                <div className="aspect-square bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden opacity-60 hover:opacity-100">
                  <img src={jersey.backImage} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-8 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-relique-accent block mb-3">
                {jersey.category || 'Curated Listing'}
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white mb-4">
                {jersey.title || 'Untitled Jersey'}
              </h2>
              <p className="text-3xl font-black text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(jersey.price)}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-10">
              {[
                { label: 'Club / Team', value: jersey.team },
                { label: 'Season', value: jersey.season || 'N/A' },
                { label: 'Condition', value: jersey.condition || 'Unspecified' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">{item.label}</p>
                  <p className="text-sm font-bold text-white/90">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-relique-primary hover:bg-relique-accent text-white font-black uppercase tracking-[0.4em] py-5 text-xs transition-colors diagonal-clip shadow-xl"
                onClick={() => alert('Proceeding to Checkout...')}
              >
                Acquire Now
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white font-black uppercase tracking-[0.4em] py-5 text-xs transition-all"
                onClick={() => onViewDetails(jersey.id)}
              >
                Detailed Collection Report
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PreviewOverlay;
