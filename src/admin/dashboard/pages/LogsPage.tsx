"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "@/components/shared/DataTable";
import { Search, User } from "lucide-react";
import type { AuditLogRow } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { auditLogsService } from "@/admin/dashboard/services/auditLogsService";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";

export default function LogsPage() {
  const [items, setItems] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 50;
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditLogsService.list({ page, pageSize });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((row) => {
      return (
        row.action.toLowerCase().includes(q) ||
        (row.actor_id ?? "").toLowerCase().includes(q) ||
        (row.entity_type ?? "").toLowerCase().includes(q) ||
        (row.entity_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery]);

  const columns = [
    {
      header: "Timestamp",
      accessor: "created_at",
      render: (r: AuditLogRow) => (
        <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString()}</span>
      ),
    },
    {
      header: "Actor",
      accessor: "actor_id",
      render: (r: AuditLogRow) => (
        <div className="flex items-center gap-2 font-bold text-gray-300">
          <User className="w-3 h-3" />
          {r.actor_id ?? "System"}
        </div>
      ),
    },
    { header: "Action", accessor: "action", render: (r: AuditLogRow) => getStatusPill(r.action) },
    {
      header: "Entity",
      accessor: "entity_type",
      render: (r: AuditLogRow) => (
        <span className="font-mono text-gray-400 text-xs">
          {[r.entity_type, r.entity_id].filter(Boolean).join(" / ") || "—"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold tracking-tight text-white">Audit Trail</h2>
        <AdminLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold tracking-tight text-white">Audit Trail</h2>
        <ErrorState message={error} onRetry={fetchLogs} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-white">Audit Trail</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, entity..."
            className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500"
          />
        </div>
      </div>
      <DataTable columns={columns} data={filteredItems} />
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
