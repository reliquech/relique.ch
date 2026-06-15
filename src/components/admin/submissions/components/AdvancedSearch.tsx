"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Clock, X } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";

type AdvancedSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
};

export function AdvancedSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
}: AdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const { recentSearches, addSearch } = useSearchHistory();
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
      if (debouncedValue.trim()) {
        addSearch(debouncedValue);
      }
    }
  }, [debouncedValue, onSearch, addSearch]);

  const handleSelectRecent = (search: string) => {
    onChange(search);
    setOpen(false);
    if (onSearch) {
      onSearch(search);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {recentSearches.length > 0 && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>Recent searches</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentSearches.slice(0, 5).map((search, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleSelectRecent(search)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {search}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

