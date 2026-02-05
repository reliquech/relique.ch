"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/shared/DataTable';
import { Search, Plus, Star, Trash2 } from 'lucide-react';
import { marketplaceAPIService } from '@/features/marketplace/services/marketplaceService';
import type { MarketplaceItem } from '@/lib/types';
import { getStatusPill } from '@/lib/utils/admin';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

export default function ItemsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

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

  const filteredItemsSearch = useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    return items.filter(i => i.title.toLowerCase().includes(query) || i.athlete.toLowerCase().includes(query) || i.category.toLowerCase().includes(query));
  }, [items, debouncedQuery]);

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await marketplaceAPIService.delete(deleteConfirmId);
        const response = await marketplaceAPIService.list({ pageSize: 1000 });
        setItems(response.items);
        toast.success('Item deleted successfully');
      } catch (err) {
        console.error('Failed to delete item:', err);
        toast.error('Failed to delete item');
      }
    }
    setDeleteConfirmId(null);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Marketplace Items</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500"
              />
            </div>
            <button
              onClick={() => router.push('/admin/marketplace/new')}
              className="bg-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform text-white"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading marketplace items...</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: 'Title', accessor: 'title', render: (r) => <span className="font-semibold text-white">{r.title}</span> },
              { header: 'Athlete', accessor: 'athlete', render: (r) => <span className="text-white">{r.athlete}</span> },
              { header: 'Status', accessor: 'status', render: (r: any) => getStatusPill(r.status) },
              { header: 'Featured', accessor: 'is_featured', render: (r: any) => r.is_featured ? <Star className="w-4 h-4 fill-accent text-accent" /> : <Star className="w-4 h-4 text-gray-700" /> },
              { header: 'Price', accessor: 'price_usd', render: (r: any) => <span className="font-mono text-gray-300 tracking-tighter font-bold">${r.price_usd.toLocaleString()}</span> }
            ]}
            data={filteredItemsSearch}
            onDelete={setDeleteConfirmId}
            onEdit={(id) => console.log('Edit', id)}
          />
        )}
      </div>
      <DeleteConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
