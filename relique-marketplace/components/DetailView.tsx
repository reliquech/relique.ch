
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Jersey, VerificationStatus } from '../types';
import { MOCK_JERSEYS } from '../constants';
import Badge from './Badge';
import JerseyCard from './JerseyCard';

interface DetailViewProps {
  jersey: Jersey;
  onBack: () => void;
  onNavigateToJersey: (id: string) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ jersey, onBack, onNavigateToJersey }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'front' | 'back' | 'gallery' | 'video'>('front');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallbacks
  const title = jersey.title || 'UNTITLED JERSEY';
  const player = jersey.player || 'TEAM-ISSUED';
  const season = jersey.season || 'SEASON N/A';
  const category = jersey.category || 'CURATED LISTING';
  const condition = jersey.condition || 'UNSPECIFIED';
  const size = jersey.size || 'N/A';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [jersey.id]);

  const relatedItems = useMemo(() => {
    return MOCK_JERSEYS.filter(j => j.id !== jersey.id).slice(0, 4);
  }, [jersey.id]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const getMediaUrl = () => {
    if (activeMediaTab === 'front') return jersey.frontImage;
    if (activeMediaTab === 'back') return jersey.backImage || jersey.frontImage;
    if (activeMediaTab === 'gallery' && jersey.gallery) return jersey.gallery[activeGalleryIndex];
    return jersey.frontImage;
  };

  const activeVideo = jersey.video_proof?.[0];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relique Archive | ${title}`,
          text: `Explore this authenticated ${category} ${title} jersey on Relique.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('URL copied to clipboard.');
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anchorLinks = [
    { name: 'Overview', href: '#overview' },
    { name: 'Provenance', href: '#provenance' },
    jersey.match && { name: 'Match', href: '#match' },
    jersey.authenticity && { name: 'Verification', href: '#verification' },
  ].filter(Boolean) as { name: string; href: string }[];

  return (
    <div className="bg-relique-bg text-white min-h-screen relative font-sans scroll-smooth">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Navigation / Header replacement */}
        <div className="mb-12 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 group">
            <svg className="w-5 h-5 text-white/30 group-hover:text-relique-accent transition-all duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">Return to Marketplace</span>
          </button>
          
          <div className="hidden md:flex gap-8">
            {anchorLinks.map((tab) => (
              <a key={tab.name} href={tab.href} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all hover:tracking-[0.5em]">
                {tab.name}
              </a>
            ))}
          </div>
        </div>

        <div className="lg:flex gap-20">
          {/* Left Column: Media & Primary Details */}
          <div className="flex-grow space-y-24">
            <motion.section id="overview" initial="hidden" animate="visible" variants={sectionVariants}>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-relique-accent">{category}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <Badge status={jersey.verificationStatus || VerificationStatus.INCONCLUSIVE} />
                {jersey.coa?.included && (
                   <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/5 px-3 py-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-green-500">COA Certified</span>
                   </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-10 max-w-4xl">
                {title}
              </h1>
              
              {/* Media Player Component */}
              <div className="space-y-8">
                <div className="aspect-square bg-white/5 relative group overflow-hidden border border-white/10">
                  <AnimatePresence mode="wait">
                    {activeMediaTab === 'video' && activeVideo ? (
                      <motion.div
                        key="video-player"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full bg-black flex flex-col items-center justify-center relative"
                      >
                        {activeVideo.url === '#' ? (
                          <div className="text-center p-12">
                            <svg className="w-16 h-16 text-relique-accent opacity-20 mx-auto mb-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14 1.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5V7.5zM4 13h10V7H4v6z"/>
                            </svg>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 uppercase">Encrypted Asset Preview</p>
                          </div>
                        ) : (
                          <video src={activeVideo.url} controls className="w-full h-full object-contain" poster={jersey.frontImage} playsInline />
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-relique-accent mb-1">Visual Evidence</p>
                                 <h4 className="text-md font-black">{activeVideo.title}</h4>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-bold text-white/60">{activeVideo.source} // {activeVideo.timestamp || 'Real-time'}</p>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.img
                        key={getMediaUrl()}
                        src={getMediaUrl()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                   <button 
                    onClick={() => setActiveMediaTab('front')}
                    className={`shrink-0 aspect-square w-20 border transition-all duration-300 ${activeMediaTab === 'front' ? 'border-relique-primary scale-110 shadow-[0_0_20px_rgba(28,77,141,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                   >
                     <img src={jersey.frontImage} className="w-full h-full object-cover" />
                   </button>
                   {jersey.backImage && (
                     <button 
                      onClick={() => setActiveMediaTab('back')}
                      className={`shrink-0 aspect-square w-20 border transition-all duration-300 ${activeMediaTab === 'back' ? 'border-relique-primary scale-110 shadow-[0_0_20px_rgba(28,77,141,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                     >
                       <img src={jersey.backImage} className="w-full h-full object-cover" />
                     </button>
                   )}
                   {jersey.video_proof && jersey.video_proof.length > 0 && (
                     <button 
                      onClick={() => setActiveMediaTab('video')}
                      className={`shrink-0 aspect-square w-20 bg-relique-navy flex items-center justify-center border transition-all duration-300 ${activeMediaTab === 'video' ? 'border-relique-primary scale-110 shadow-[0_0_20px_rgba(28,77,141,0.3)]' : 'border-relique-accent/30 opacity-70 hover:opacity-100'}`}
                     >
                       <svg className="w-6 h-6 text-relique-ice" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14 1.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5V7.5zM4 13h10V7H4v6z"/>
                      </svg>
                     </button>
                   )}
                </div>
              </div>
            </motion.section>

            {/* Provenance */}
            {jersey.provenance && (
              <motion.section id="provenance" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="pt-24 border-t border-white/5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">I. Provenance & Narrative</h2>
                <div className="max-w-3xl">
                  <p className="text-xl leading-relaxed text-white font-medium mb-16 italic opacity-90">
                    {jersey.provenance.narrative}
                  </p>
                </div>
              </motion.section>
            )}

            {/* Match Context (Conditional) */}
            {jersey.match && (
              <motion.section id="match" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="pt-24 border-t border-white/5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">II. Competitive Context</h2>
                <div className="bg-relique-card border border-white/10 p-10 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-10">
                  {[
                    { label: 'Competition', value: jersey.match.competition },
                    { label: 'Date', value: jersey.match.date },
                    { label: 'Opponent', value: jersey.match.opponent },
                    { label: 'Venue / Pitch', value: jersey.match.venue },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">{item.label}</p>
                      <p className="text-sm font-black">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Verification (Conditional) */}
            {jersey.authenticity && (
              <motion.section id="verification" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="pt-24 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">III. Analysis Report</h2>
                    <p className="text-3xl font-black italic tracking-tighter text-relique-ice opacity-50">REF: {jersey.id.toUpperCase()}</p>
                  </div>
                  <Badge status={jersey.verificationStatus || VerificationStatus.INCONCLUSIVE} />
                </div>
                <p className="text-lg leading-relaxed text-white/80 font-medium bg-relique-navy/10 border border-relique-primary/20 p-10">{jersey.authenticity.methodology_summary}</p>
              </motion.section>
            )}

            {/* Related Items */}
            <section className="pt-24 border-t border-white/5">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">IV. Related Assets</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {relatedItems.map(item => (
                    <JerseyCard key={item.id} jersey={item} onClick={() => onNavigateToJersey(item.id)} />
                  ))}
               </div>
            </section>
          </div>

          {/* Right Column: Sticky Purchase Panel */}
          <aside className="lg:w-[380px] shrink-0 mt-20 lg:mt-0">
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="bg-relique-card border border-white/10 p-10 shadow-2xl relative overflow-hidden">
                <div className="mb-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">Fixed Valuation</p>
                   <p className="text-5xl font-black text-white tracking-tighter">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(jersey.price)}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Share button (Ghost style) */}
                  <button 
                    onClick={handleShare}
                    className="w-full bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.4em] py-4 text-[9px] transition-all hover:bg-white/5 hover:border-white/30 flex items-center justify-center gap-3 relative overflow-hidden"
                  >
                    <AnimatePresence>
                      {copied && (
                        <motion.span 
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          exit={{ y: -20, opacity: 0 }} 
                          className="absolute inset-0 flex items-center justify-center bg-relique-primary text-[8px]"
                        >
                          COPIED TO CLIPBOARD
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Listing
                  </button>

                  <button 
                    className="w-full bg-relique-primary hover:bg-relique-accent text-white font-black uppercase tracking-[0.5em] py-6 text-xs transition-all duration-300 diagonal-clip shadow-[0_0_40px_rgba(28,77,141,0.2)]"
                    onClick={() => alert('Initiating Secure Purchase Flow...')}
                  >
                    Acquire Piece
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to Top Arrow */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 30 }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(28,77,141,1)' }}
            onClick={scrollToTop}
            className="fixed bottom-12 right-12 z-50 bg-relique-primary/90 backdrop-blur-md p-5 shadow-2xl diagonal-clip text-white transition-all duration-300"
            aria-label="Back to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="h-40" />
    </div>
  );
};

export default DetailView;
