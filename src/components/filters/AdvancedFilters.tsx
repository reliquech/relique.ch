"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import type { MarketplaceFilters } from "@/lib/types";

interface AdvancedFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  availableOptions: {
    sports: string[];
    categories: string[];
    signedBy: string[];
    statuses: string[];
    coaIssuers: string[];
  };
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableOptions,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<MarketplaceFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const reset: MarketplaceFilters = {};
    setLocalFilters(reset);
    onFiltersChange(reset);
    setOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Filter marketplace items by multiple criteria
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={localFilters.category || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, category: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableOptions.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sport</Label>
            <Select
              value={localFilters.sport || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, sport: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {availableOptions.sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Signed By</Label>
            <Select
              value={localFilters.signedBy || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, signedBy: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Signers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signers</SelectItem>
                {availableOptions.signedBy.map((signer) => (
                  <SelectItem key={signer} value={signer}>
                    {signer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value === "all" ? undefined : value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>COA Issuer</Label>
            <Select
              value={localFilters.coaIssuer || "all"}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, coaIssuer: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Issuers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issuers</SelectItem>
                {availableOptions.coaIssuers.map((issuer) => (
                  <SelectItem key={issuer} value={issuer}>
                    {issuer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Price ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.priceMin || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price ($)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={localFilters.priceMax || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceMax: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

