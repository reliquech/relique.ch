"use client";

import React from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import DataTable from "@/components/shared/DataTable";
import { DataTableCards } from "@/components/shared/DataTableCards";

interface Column {
  header: string | React.ReactNode;
  accessor: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface ResponsiveDataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  getRowClassName?: (row: Record<string, unknown>) => string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onConvert?: (row: Record<string, unknown>) => void;
  isConvertDisabled?: (row: Record<string, unknown>) => boolean;
  onComplete?: (row: Record<string, unknown>) => void;
  isCompleteDisabled?: (row: Record<string, unknown>) => boolean;
  onEmail?: (row: Record<string, unknown>) => void;
  mobileTitleAccessor?: string;
  mobileSubtitleAccessor?: string;
}

export function ResponsiveDataTable(props: ResponsiveDataTableProps) {
  const isMobile = useIsMobile(768);

  if (isMobile) {
    return (
      <DataTableCards
        columns={props.columns}
        data={props.data}
        titleColumn={props.mobileTitleAccessor ?? props.columns[0]?.accessor}
        subtitleColumn={props.mobileSubtitleAccessor ?? props.columns[1]?.accessor}
        onRowClick={(row) => {
          if (props.onView) props.onView(String(row.id));
          else if (props.onEdit) props.onEdit(String(row.id));
        }}
      />
    );
  }

  return (
    <DataTable
      columns={props.columns}
      data={props.data}
      getRowClassName={props.getRowClassName}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onView={props.onView}
      onConvert={props.onConvert}
      isConvertDisabled={props.isConvertDisabled}
      onComplete={props.onComplete}
      isCompleteDisabled={props.isCompleteDisabled}
      onEmail={props.onEmail}
    />
  );
}
