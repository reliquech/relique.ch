"use client";

import React from "react";
import type { CustomField } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomFieldsSectionProps {
  fields: CustomField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  readOnly?: boolean;
}

function normalizeOptions(options?: string[] | null) {
  return (options ?? []).map((opt) => opt.trim()).filter(Boolean);
}

export function CustomFieldsSection({ fields, values, onChange, readOnly = false }: CustomFieldsSectionProps) {
  if (!fields.length) return null;

  const handleValueChange = (fieldId: string, value: unknown) => {
    onChange({ ...values, [fieldId]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-white">Custom Fields</h4>
        <p className="text-xs text-gray-500">Additional attributes for this record.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const value = values[field.id];
          const options = normalizeOptions(field.options ?? null);
          const label = `${field.name}${field.required ? " *" : ""}`;

          if (field.field_type === "textarea") {
            return (
              <div key={field.id} className="sm:col-span-2">
                <Label className="text-gray-300">{label}</Label>
                <textarea
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 min-h-[80px]"
                  placeholder={field.key}
                  disabled={readOnly}
                />
              </div>
            );
          }

          if (field.field_type === "boolean") {
            return (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => handleValueChange(field.id, e.target.checked)}
                  className="h-4 w-4"
                  disabled={readOnly}
                />
                <Label className="text-gray-300">{label}</Label>
              </div>
            );
          }

          if (field.field_type === "select") {
            return (
              <div key={field.id}>
                <Label className="text-gray-300">{label}</Label>
                <select
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
                  disabled={readOnly}
                >
                  <option value="">Select option</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.field_type === "multiselect") {
            const current = Array.isArray(value) ? value.map(String) : [];
            return (
              <div key={field.id}>
                <Label className="text-gray-300">{label}</Label>
                <select
                  multiple
                  value={current}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    handleValueChange(field.id, selected);
                  }}
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 min-h-[110px]"
                  disabled={readOnly}
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple</p>
              </div>
            );
          }

          if (field.field_type === "number") {
            return (
              <div key={field.id}>
                <Label className="text-gray-300">{label}</Label>
                <Input
                  type="number"
                  value={value === undefined || value === null ? "" : String(value)}
                  onChange={(e) => handleValueChange(field.id, e.target.value === "" ? null : Number(e.target.value))}
                  className="bg-white/5 border-border text-white mt-1"
                  placeholder={field.key}
                  disabled={readOnly}
                />
              </div>
            );
          }

          if (field.field_type === "date") {
            return (
              <div key={field.id}>
                <Label className="text-gray-300">{label}</Label>
                <Input
                  type="date"
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="bg-white/5 border-border text-white mt-1"
                  disabled={readOnly}
                />
              </div>
            );
          }

          if (field.field_type === "url") {
            return (
              <div key={field.id}>
                <Label className="text-gray-300">{label}</Label>
                <Input
                  type="url"
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="bg-white/5 border-border text-white mt-1"
                  placeholder="https://"
                  disabled={readOnly}
                />
              </div>
            );
          }

          return (
            <div key={field.id}>
              <Label className="text-gray-300">{label}</Label>
              <Input
                value={typeof value === "string" ? value : value === undefined || value === null ? "" : String(value)}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                className="bg-white/5 border-border text-white mt-1"
                placeholder={field.key}
                disabled={readOnly}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
