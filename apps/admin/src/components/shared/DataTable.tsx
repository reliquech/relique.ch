"use client";

import React from 'react';
import { Edit, Trash2, Eye, UserPlus, Mail, CheckCircle2 } from 'lucide-react';

interface Column {
  header: string | React.ReactNode;
  accessor: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  getRowClassName?: (row: any) => string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onConvert?: (row: any) => void;
  isConvertDisabled?: (row: any) => boolean;
  onComplete?: (row: any) => void;
  isCompleteDisabled?: (row: any) => boolean;
  onEmail?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  getRowClassName,
  onEdit,
  onDelete,
  onView,
  onConvert,
  isConvertDisabled,
  onComplete,
  isCompleteDisabled,
  onEmail,
}) => {
  const hasActions = onEdit || onDelete || onView || onConvert || onEmail || onComplete;
  return (
    <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-border">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 italic">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-white/5 transition-colors group ${getRowClassName ? getRowClassName(row) : ""}`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-sm font-medium text-white">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {onView && (
                        <button 
                          onClick={() => onView(row.id)}
                          className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onConvert && (
                        <button
                          type="button"
                          onClick={() => onConvert(row)}
                          disabled={isConvertDisabled ? isConvertDisabled(row) : false}
                          className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title={isConvertDisabled && isConvertDisabled(row) ? "Already converted" : "Convert to Customer"}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {onEmail && (
                        <button
                          type="button"
                          onClick={() => onEmail(row)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {onComplete && (
                        <button
                          type="button"
                          onClick={() => onComplete(row)}
                          disabled={isCompleteDisabled ? isCompleteDisabled(row) : false}
                          className="p-2 text-gray-400 hover:text-success hover:bg-success/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title={isCompleteDisabled && isCompleteDisabled(row) ? "Already completed" : "Mark as done"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(row.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(row.id)}
                          className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
