"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, GripVertical, Eye, ArrowUp, ArrowDown, Layout, ShoppingBag } from 'lucide-react';
import { marketplaceAPIService } from '@/admin/marketplace/services/marketplaceService';
import type { MarketplaceItem } from '@/lib/types/admin';
import { toast } from 'sonner';

export default function FeaturedPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    return items.filter(i => i.is_featured).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
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

  const moveFeatured = async (index: number, direction: 'up' | 'down') => {
    const featured = items.filter(i => i.is_featured).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === featured.length - 1)) return;
    
    const newFeatured = [...featured];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const currentItem = newFeatured[index];
    const targetItem = newFeatured[targetIndex];
    if (!currentItem || !targetItem) return;
    
    [newFeatured[index], newFeatured[targetIndex]] = [targetItem, currentItem];
    
    try {
      await Promise.all(newFeatured.map((item, idx) => 
        marketplaceAPIService.update(item.id, { ...item, featured_order: idx + 1 })
      ));
      
      const response = await marketplaceAPIService.list({ pageSize: 1000 });
      setItems(response.items);
      toast.success('Featured items reordered');
    } catch (err) {
      console.error('Failed to reorder featured items:', err);
      toast.error('Failed to reorder featured items');
    }
  };

  const toggleFeatured = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newState = !item.is_featured;
    try {
      await marketplaceAPIService.update(id, {
        ...item,
        is_featured: newState,
        featured_order: newState ? items.filter(i => i.is_featured).length + 1 : null,
      });
      
      const response = await marketplaceAPIService.list({ pageSize: 1000 });
      setItems(response.items);
      toast.success(newState ? 'Item featured' : 'Item unfeatured');
    } catch (err) {
      console.error('Failed to update featured status:', err);
      toast.error('Failed to update featured status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Carousel Manager</h2>
          <p className="text-gray-400 mt-1">Reorder and manage featured assets displayed on the home page.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg flex items-center gap-3">
          <Layout className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary uppercase tracking-widest">{featuredItems.length} Featured Items</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <GripVertical className="w-4 h-4" /> Live Order
          </h3>
          <div className="space-y-3">
            {featuredItems.map((item, idx) => (
              <div key={item.id} className="bg-surface border border-border p-4 rounded-xl flex items-center gap-4 group hover:border-primary/50 transition-all shadow-lg">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveFeatured(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-colors text-white"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveFeatured(idx, 'down')}
                    disabled={idx === featuredItems.length - 1}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-colors text-white"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-border shrink-0">
                  <ShoppingBag className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.athlete} • {item.category}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className="text-gray-500 hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {featuredItems.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center text-gray-500">
                No items currently featured. Go to Marketplace to add items.
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent" /> Selection Explorer
          </h3>
          <div className="relative group mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Quick search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-0 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCatalog.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 border border-border flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-700 group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-300">{item.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.athlete}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className="bg-accent/10 hover:bg-accent text-accent hover:text-black p-1.5 rounded transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
