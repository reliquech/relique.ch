
import React, { useState } from 'react';
import { FilterState, JerseyCategory, VerificationStatus } from '../types';
import { CATEGORIES, TEAMS, VERIFICATION_STATUSES } from '../constants';

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onClose?: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, setFilters, onClose }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    category: true,
    team: true,
    verification: true,
    price: true,
  });

  const toggleExpanded = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxChange = (group: keyof FilterState, value: any) => {
    const current = (filters[group] as any[]) || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFilters({ ...filters, [group]: updated });
  };

  // Fixed: children is made optional to satisfy the compiler which was incorrectly identifying it as missing in the JSX blocks below
  const FilterGroup = ({ title, groupKey, children }: { title: string, groupKey: string, children?: React.ReactNode }) => (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => toggleExpanded(groupKey)}
        className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 hover:text-white transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${expanded[groupKey] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded[groupKey] && <div className="space-y-2 mt-4">{children}</div>}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-relique-card md:bg-transparent overflow-y-auto no-scrollbar">
      {onClose && (
        <div className="p-4 border-b border-white/10 flex justify-between items-center md:hidden">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Filters</span>
          <button onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6 md:p-0 space-y-2">
        <FilterGroup title="Category" groupKey="category">
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => handleCheckboxChange('category', cat)}
                className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Club / Team" groupKey="team">
          {TEAMS.map(team => (
            <label key={team} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.team.includes(team)}
                onChange={() => handleCheckboxChange('team', team)}
                className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                {team}
              </span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Verification" groupKey="verification">
          {VERIFICATION_STATUSES.map(status => (
            <label key={status} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.verification.includes(status)}
                onChange={() => handleCheckboxChange('verification', status)}
                className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors uppercase tracking-[0.1em]">
                {status}
              </span>
            </label>
          ))}
        </FilterGroup>

        <div className="py-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">COA Included Only</span>
            <input
              type="checkbox"
              checked={filters.coaOnly}
              onChange={(e) => setFilters({ ...filters, coaOnly: e.target.checked })}
              className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">Back Photo Available</span>
            <input
              type="checkbox"
              checked={filters.hasBackPhoto}
              onChange={(e) => setFilters({ ...filters, hasBackPhoto: e.target.checked })}
              className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">Video Proof Available</span>
            <input
              type="checkbox"
              checked={filters.hasVideo}
              onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
              className="w-4 h-4 rounded-none bg-relique-bg border-white/10 text-relique-primary focus:ring-0 focus:ring-offset-0"
            />
          </label>
        </div>

        <button
          onClick={() => setFilters({
            search: '',
            category: [],
            team: [],
            verification: [],
            coaOnly: false,
            priceRange: [0, 100000],
            hasBackPhoto: false,
            hasVideo: false,
            sortBy: 'newest'
          })}
          className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-relique-accent hover:text-relique-ice transition-colors pt-4 text-left"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default SidebarFilters;
