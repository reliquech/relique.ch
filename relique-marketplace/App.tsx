
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterState, Jersey, VerificationStatus } from './types';
import { MOCK_JERSEYS, COLORS } from './constants';
import SidebarFilters from './components/SidebarFilters';
import JerseyCard from './components/JerseyCard';
import PreviewOverlay from './components/PreviewOverlay';
import DetailView from './components/DetailView';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'marketplace' | 'detail'>('marketplace');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: [],
    team: [],
    verification: [],
    coaOnly: false,
    priceRange: [0, 100000],
    hasBackPhoto: false,
    hasVideo: false,
    sortBy: 'newest'
  });
  const [selectedJersey, setSelectedJersey] = useState<Jersey | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredJerseys = useMemo(() => {
    return MOCK_JERSEYS.filter(j => {
      const matchesSearch = !filters.search || 
        (j.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (j.player || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (j.team || '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category.length === 0 || (j.category && filters.category.includes(j.category));
      const matchesTeam = filters.team.length === 0 || (j.team && filters.team.includes(j.team));
      const matchesVerification = filters.verification.length === 0 || (j.verificationStatus && filters.verification.includes(j.verificationStatus));
      const matchesCoa = !filters.coaOnly || j.coa?.included;
      const matchesBackPhoto = !filters.hasBackPhoto || !!j.backImage;
      const matchesVideo = !filters.hasVideo || (j.video_proof && j.video_proof.length > 0);

      return matchesSearch && matchesCategory && matchesTeam && matchesVerification && matchesCoa && matchesBackPhoto && matchesVideo;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'popular') return b.likeCount - a.likeCount;
      return 0;
    });
  }, [filters]);

  const handleCardClick = (jersey: Jersey) => {
    setSelectedJersey(jersey);
  };

  const handleViewDetails = (jerseyId: string) => {
    const jersey = MOCK_JERSEYS.find(j => j.id === jerseyId);
    if (jersey) {
      setSelectedJersey(jersey);
      setView('detail');
    }
  };

  const handleNavigateToJersey = (id: string) => {
    const jersey = MOCK_JERSEYS.find(j => j.id === id);
    if (jersey) {
      setSelectedJersey(jersey);
      setView('detail');
    }
  };

  if (view === 'detail' && selectedJersey) {
    return (
      <DetailView 
        jersey={selectedJersey} 
        onBack={() => setView('marketplace')} 
        onNavigateToJersey={handleNavigateToJersey}
      />
    );
  }

  return (
    <div className="min-h-screen bg-relique-bg text-white font-sans selection:bg-relique-primary selection:text-white">
      {/* Toolbar area */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 pt-12 pb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-relique-card border border-white/5 p-6 shadow-xl">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search the archive (Player, Club, or Competition)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-relique-primary transition-all pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden xl:block text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Sort By</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-white/5 border border-white/10 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-relique-primary transition-colors cursor-pointer min-w-[200px]"
            >
              <option value="newest">NEWLY LISTED</option>
              <option value="price_asc">PRICE: LOW TO HIGH</option>
              <option value="price_desc">PRICE: HIGH TO LOW</option>
              <option value="popular">MOST WATCHED</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 md:px-12 py-6 flex flex-col md:flex-row gap-12">
        <aside className="hidden md:block w-72 shrink-0 sticky top-12 h-fit pb-12">
          <SidebarFilters filters={filters} setFilters={setFilters} />
        </aside>

        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between mb-8 gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 whitespace-nowrap">
                {filteredJerseys.length} {filteredJerseys.length === 1 ? 'ASSET' : 'ASSETS'} RETRIEVED
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-relique-card border border-white/10 p-8 animate-pulse space-y-6 h-[550px]">
                  <div className="aspect-square bg-white/5" />
                  <div className="h-5 w-1/2 bg-white/5" />
                  <div className="h-8 w-3/4 bg-white/5" />
                  <div className="h-16 w-full bg-white/5 mt-auto" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredJerseys.map((jersey) => (
                  <JerseyCard key={jersey.id} jersey={jersey} onClick={handleCardClick} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedJersey && (
          <PreviewOverlay 
            jersey={selectedJersey} 
            onClose={() => setSelectedJersey(null)}
            onViewDetails={handleViewDetails}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
