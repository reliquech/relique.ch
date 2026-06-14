"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnchorItem {
  id: string;
  label: string;
}

interface AnchorNavProps {
  items: AnchorItem[];
  className?: string;
}

export function AnchorNav({ items, className }: AnchorNavProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (!item) continue;
        const element = document.getElementById(item.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
      });
    }
  };

  return (
    <nav
      className={cn(
        "hidden lg:block sticky top-20 self-start",
        className
      )}
    >
      <div className="border-l-2 border-muted pl-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "block text-left text-sm transition-colors hover:text-foreground",
              activeId === item.id
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

