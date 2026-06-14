"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "@/components/shared/DataTable";
import { Search, Plus } from "lucide-react";
import type { VerifyRecord } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { verifyService } from "@/lib/legacy/verifyService";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";

function mapHistoryToRecord(
  entry: { productId: string; result: string; timestamp: number },
  index: number
): VerifyRecord {
  return {
    id: `verify-${entry.productId}-${index}`,
    pid: entry.productId,
    name: entry.productId,
    signatures: 0,
    result: entry.result as VerifyRecord["result"],
    date: new Date(entry.timestamp).toISOString().slice(0, 10),
  };
}

export default function VerifyPage() {
  const [verifyRecords, setVerifyRecords] = useState<VerifyRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await verifyService.history.list();
      const rows = history.map((entry, i) => mapHistoryToRecord(entry, i));
      setVerifyRecords(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verification records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return verifyRecords;
    const q = searchQuery.toLowerCase();
    return verifyRecords.filter((r) => r.pid.toLowerCase().includes(q));
  }, [verifyRecords, searchQuery]);

  const verifyCols = [
    {
      header: "Product ID",
      accessor: "pid",
      render: (r: VerifyRecord) => (
        <span className="font-mono text-primary font-bold tracking-wider">{r.pid}</span>
      ),
    },
    {
      header: "Item Name",
      accessor: "name",
      render: (r: VerifyRecord) => <span className="text-white">{r.name}</span>,
    },
    {
      header: "Sigs",
      accessor: "signatures",
      render: (r: VerifyRecord) => <span className="text-white">{r.signatures}</span>,
    },
    {
      header: "Result",
      accessor: "result",
      render: (r: VerifyRecord) => getStatusPill(r.result),
    },
    {
      header: "Date",
      accessor: "date",
      render: (r: VerifyRecord) => <span className="text-white">{r.date}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Verification Records</h2>
        </div>
        <AdminLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold tracking-tight text-white">Verification Records</h2>
        <ErrorState message={error} onRetry={fetchRecords} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Verification Records</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PID..."
              className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500"
            />
          </div>
          <button
            type="button"
            className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" /> New Certificate
          </button>
        </div>
      </div>
      <DataTable columns={verifyCols} data={filteredRecords} />
    </div>
  );
}
