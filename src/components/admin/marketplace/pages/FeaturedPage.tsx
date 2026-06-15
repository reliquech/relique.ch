"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, ArrowUp, ArrowDown, Layout, ShoppingBag, Eye, GripVertical } from 'lucide-react';
import { marketplaceAPIService } from '@/features/marketplace/services/marketplaceService';
import type { MarketplaceItem } from '@/lib/types/admin';
import { toast } from 'sonner';
import { useAdminHeader } from '@/components/admin/shell/AdminPortalLayout';

export default function FeaturedPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [originalItems, setOriginalItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useAdminHeader("Carousel Manager", ["Marketplace", "Carousel"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch marketplace items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marketplaceAPIService.list({ pageSize: 1000 });
        setItems(response.items);
        setOriginalItems(response.items);
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err);
        setError('Failed to load marketplace items');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchItems();
    }
  }, [mounted]);

  const featuredItems = useMemo(() => {
    return items
      .filter(i => i.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
  }, [items]);

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return items.filter((i) => !i.is_featured);
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        !i.is_featured &&
        (i.title.toLowerCase().includes(q) ||
          i.athlete.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const hasUnsavedChanges = useMemo(() => {
    if (items.length !== originalItems.length) return true;
    return items.some((item) => {
      const orig = originalItems.find((o) => o.id === item.id);
      if (!orig) return true;
      return (
        orig.is_featured !== item.is_featured ||
        orig.featured_order !== item.featured_order
      );
    });
  }, [items, originalItems]);

  const moveFeatured = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === featuredItems.length - 1)) return;
    
    const newFeatured = [...featuredItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const currentItem = newFeatured[index];
    const targetItem = newFeatured[targetIndex];
    if (!currentItem || !targetItem) return;
    
    // Swap positions
    [newFeatured[index], newFeatured[targetIndex]] = [targetItem, currentItem];
    
    // Re-assign featured_order
    const updatedFeatured = newFeatured.map((item, idx) => ({
      ...item,
      featured_order: idx + 1
    }));
    
    // Merge back into all items
    const updatedItems = items.map((item) => {
      const match = updatedFeatured.find((f) => f.id === item.id);
      if (match) return match;
      return item;
    });
    
    setItems(updatedItems);
  };

  const toggleFeatured = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newState = !item.is_featured;
    
    // Guard: max 8 items featured
    if (newState && featuredItems.length >= 8) {
      toast.error("You can only feature up to 8 items in the carousel");
      return;
    }

    let updatedItems = items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          is_featured: newState,
          featured_order: newState ? featuredItems.length + 1 : null,
        };
      }
      return i;
    });

    // Re-index remaining featured items if we removed one
    if (!newState) {
      const remainingFeatured = updatedItems
        .filter((i) => i.is_featured)
        .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
      
      updatedItems = updatedItems.map((i) => {
        if (i.is_featured) {
          const idx = remainingFeatured.findIndex((rf) => rf.id === i.id);
          return {
            ...i,
            featured_order: idx + 1,
          };
        }
        return i;
      });
    }

    setItems(updatedItems);
  };

  const handleSaveChanges = async () => {
    const dirtyItems = items.filter((item) => {
      const orig = originalItems.find((o) => o.id === item.id);
      if (!orig) return false;
      return (
        orig.is_featured !== item.is_featured ||
        orig.featured_order !== item.featured_order
      );
    });

    if (dirtyItems.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(
        dirtyItems.map((item) =>
          marketplaceAPIService.update(item.id, {
            is_featured: item.is_featured,
            featured_order: item.featured_order,
          })
        )
      );
      
      // Re-fetch to get clean server state
      const response = await marketplaceAPIService.list({ pageSize: 1000 });
      setItems(response.items);
      setOriginalItems(response.items);
      toast.success("Featured items saved successfully");
    } catch (err) {
      console.error('Failed to save featured changes:', err);
      toast.error('Failed to save featured changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stitch-on-surface-variant">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stitch-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-semibold text-sm">Loading Carousel Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-6 border-b border-stitch-outline-variant">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stitch-on-surface">Carousel Manager</h2>
          <p className="text-stitch-on-surface-variant mt-1 text-sm md:text-base">Reorder and manage featured assets displayed on the home page.</p>
        </div>
        <div>
          <button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || saving}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 uppercase tracking-wider flex items-center gap-2 ${
              hasUnsavedChanges
                ? "bg-stitch-primary text-stitch-on-primary hover:bg-stitch-primary/95 shadow-sm active:scale-[0.98]"
                : "bg-stitch-surface-container-high text-stitch-on-surface-variant/40 cursor-not-allowed border border-stitch-outline-variant/30"
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-stitch-on-primary border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Carousel Default Preview Strip */}
      <section className="bg-stitch-surface border border-stitch-outline-variant p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-stitch-on-surface-variant">
          <Layout className="w-5 h-5 text-stitch-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Carousel Preview</h3>
        </div>
        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x scroll-smooth">
            {featuredItems.map((item) => (
              <div key={item.id} className="flex-none w-72 aspect-video rounded-xl overflow-hidden border border-stitch-outline-variant snap-start bg-stitch-surface-container relative group/card">
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stitch-on-surface-variant bg-stitch-surface-container-high p-4 text-center">
                    <ShoppingBag className="w-8 h-8 opacity-45 mb-2" />
                    <span className="text-xs font-semibold">No Image Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                  <span className="text-xs font-bold text-stitch-primary uppercase tracking-wider mb-1">{item.athlete}</span>
                  <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                  <span className="text-xs text-white/70 mt-1 uppercase tracking-wider">{item.category}</span>
                </div>
              </div>
            ))}
            {featuredItems.length === 0 && (
              <div className="w-full py-12 text-center text-stitch-on-surface-variant flex flex-col items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-semibold">No featured items yet.</p>
                <p className="text-xs opacity-75 mt-1">Use the explorer below to add items to your carousel.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid Layout for Live Order & Catalog Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Live Order list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-stitch-surface border border-stitch-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-stitch-on-surface-variant">
                <GripVertical className="w-5 h-5 text-stitch-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Live Order</h3>
              </div>
              
              <div className="bg-stitch-surface-container-low border border-stitch-outline-variant p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-stitch-on-surface-variant">
                  <span>MAX 8 ITEMS</span>
                  <span className="text-stitch-on-surface">{featuredItems.length}/8 Featured Items</span>
                </div>
                <div className="h-2 w-full bg-stitch-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-stitch-primary transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min((featuredItems.length / 8) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {featuredItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 rounded-xl border border-stitch-outline-variant bg-stitch-surface hover:bg-stitch-surface-container-low transition-all duration-150 group"
                >
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => moveFeatured(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-stitch-surface-container-high rounded disabled:opacity-20 transition-all text-stitch-on-surface hover:text-stitch-primary"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFeatured(idx, 'down')}
                      disabled={idx === featuredItems.length - 1}
                      className="p-1 hover:bg-stitch-surface-container-high rounded disabled:opacity-20 transition-all text-stitch-on-surface hover:text-stitch-primary"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="w-16 h-12 rounded bg-stitch-surface-container-highest overflow-hidden flex-shrink-0 border border-stitch-outline-variant flex items-center justify-center">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-stitch-on-surface-variant/40" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stitch-on-surface truncate text-sm md:text-base">{item.title}</h4>
                    <p className="text-xs text-stitch-on-surface-variant font-medium mt-0.5">{item.athlete} • {item.category}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleFeatured(item.id)}
                    className="text-stitch-on-surface-variant hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-150 flex items-center gap-1 text-xs font-semibold"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ))}

              {featuredItems.length === 0 && (
                <div className="border-2 border-dashed border-stitch-outline-variant/60 rounded-xl p-12 text-center text-stitch-on-surface-variant bg-stitch-surface-container-low/30">
                  <ShoppingBag className="w-8 h-8 opacity-25 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No items currently featured.</p>
                  <p className="text-xs opacity-75 mt-1">Search the catalog and click add to select featured items.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selection Explorer */}
        <div className="lg:col-span-1">
          <div className="bg-stitch-surface border border-stitch-outline-variant rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-stitch-on-surface-variant">
              <Eye className="w-5 h-5 text-stitch-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Selection Explorer</h3>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stitch-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Quick search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stitch-surface-container-low border border-stitch-outline-variant rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-stitch-primary text-stitch-on-surface placeholder:text-stitch-on-surface-variant/60 transition-all duration-150"
              />
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 hide-scrollbar">
              {filteredCatalog.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-stitch-surface-container-low border border-transparent hover:border-stitch-outline-variant transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-stitch-surface-container-highest overflow-hidden border border-stitch-outline-variant flex items-center justify-center flex-shrink-0">
                      {item.cover_image_url ? (
                        <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-stitch-on-surface-variant/45" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stitch-on-surface truncate">{item.title}</p>
                      <p className="text-[10px] text-stitch-on-surface-variant font-bold uppercase tracking-wider mt-0.5 truncate">{item.athlete}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleFeatured(item.id)}
                    className="bg-stitch-primary/10 hover:bg-stitch-primary text-stitch-primary hover:text-stitch-on-primary p-2 rounded-lg transition-all duration-150 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {filteredCatalog.length === 0 && (
                <p className="text-xs text-center text-stitch-on-surface-variant/60 py-6">
                  {searchQuery ? "No matching items found." : "All items have been featured."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
