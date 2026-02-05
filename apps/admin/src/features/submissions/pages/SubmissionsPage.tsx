"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubmissionsTable, type SubmissionRow } from "@/features/submissions/components/SubmissionsTable";
import { SubmissionsHeader } from "@/features/submissions/components/SubmissionsHeader";
import { verifyService } from "@/lib/legacy/verifyService";
import { consignedService } from "@/features/submissions/services/consignedService";
import { useSearchParams } from "next/navigation";
import { useSubmissionsColumns } from "@/features/submissions/components/useSubmissionsColumns";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/useStorageSync";

function SubmissionsPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "verifications" || tab === "consignments") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = storage.admin.views.columns.get();
    setColumnVisibility(saved);
  }, []);

  const handleView = (row: SubmissionRow) => {
    // TODO: Open detail drawer
    console.log("View", row);
  };

  const handleDuplicate = (row: SubmissionRow) => {
    // TODO: Duplicate draft
    console.log("Duplicate", row);
  };

  const handleDelete = (row: SubmissionRow) => {
    // TODO: Delete with undo
    console.log("Delete", row);
  };

  const columns = useSubmissionsColumns(handleView, handleDuplicate, handleDelete);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [history, consignedRes] = await Promise.all([
        verifyService.history.list(),
        consignedService.list({ pageSize: 500 }),
      ]);

      const rows: SubmissionRow[] = [];

      history.forEach((entry) => {
        rows.push({
          id: `verify-${entry.productId}`,
          type: "verify",
          reference: entry.productId,
          itemName: `Item ${entry.productId}`,
          status: entry.result,
          dateUpdated: entry.timestamp,
          data: entry,
        });
      });

      (consignedRes.items || []).forEach((item: { id: string; item_description: string; status: string; updated_at: string }) => {
        rows.push({
          id: item.id,
          type: "consign",
          reference: item.id,
          itemName: item.item_description || "—",
          status: item.status,
          dateUpdated: new Date(item.updated_at).getTime(),
          data: item as unknown as SubmissionRow["data"],
        });
      });

      rows.sort((a, b) => b.dateUpdated - a.dateUpdated);
      setSubmissions(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useStorageSync(
    ["relique.v1.verify.history"],
    () => {
      loadSubmissions();
    }
  );

  const filteredSubmissions = useMemo(() => {
    if (activeTab === "all") return submissions;
    if (activeTab === "verifications") {
      return submissions.filter((s) => s.type === "verify");
    }
    if (activeTab === "consignments") {
      return submissions.filter((s) => s.type === "consign");
    }
    return submissions;
  }, [submissions, activeTab]);

  const handleColumnVisibilityChange = (visibility: Record<string, boolean>) => {
    setColumnVisibility(visibility);
    storage.admin.views.columns.set(visibility);
  };

  const handleExport = () => {
    // TODO: Export CSV/JSON
    console.log("Export", filteredSubmissions);
  };

  return (
    <div className="space-y-4">
      <SubmissionsHeader
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onExport={handleExport}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="consignments">Consignments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadSubmissions} />
          ) : (
            <SubmissionsTable
              data={filteredSubmissions}
              columns={columns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SubmissionsPage() {
  return <SubmissionsPageContent />;
}
