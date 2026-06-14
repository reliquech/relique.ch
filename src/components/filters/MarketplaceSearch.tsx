"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function MarketplaceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);
  const lastPushedSearch = useRef<string>(debouncedSearch);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    // Prevent infinite loop: only push if debouncedSearch actually changed
    if (debouncedSearch === lastPushedSearch.current) return;
    if (debouncedSearch === currentSearch) {
      lastPushedSearch.current = debouncedSearch;
      return;
    }
    
    lastPushedSearch.current = debouncedSearch;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/marketplace?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

