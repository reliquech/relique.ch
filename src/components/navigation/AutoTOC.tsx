"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface AutoTOCProps {
  containerId?: string;
  className?: string;
  variant?: "inline" | "sidebar";
}

export function AutoTOC({ containerId, className, variant = "inline" }: AutoTOCProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = containerId
      ? document.getElementById(containerId)
      : document.body;

    if (!container) return;

    const headings = container.querySelectorAll("h2, h3, h4");
    const tocItems: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }

      const level = parseInt(heading.tagName.charAt(1));
      tocItems.push({
        id,
        text: heading.textContent || "",
        level,
      });
    });

    setItems(tocItems);
  }, [containerId]);

  useEffect(() => {
    if (variant === "sidebar") {
      const handleScroll = () => {
        const headings = document.querySelectorAll("h2, h3, h4");
        let current = "";
        headings.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100) {
            current = heading.id;
          }
        });
        setActiveId(current);
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant]);

  if (items.length === 0) return null;

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

  if (variant === "sidebar") {
    return (
      <nav className={cn("hidden lg:block", className)}>
        <div className="sticky top-24">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide">Contents</h2>
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "text-sm",
                  item.level === 2 && "pl-0",
                  item.level === 3 && "pl-4",
                  item.level === 4 && "pl-8"
                )}
              >
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "text-left transition-colors hover:text-foreground",
                    activeId === item.id
                      ? "text-foreground border-b-2 border-accent pb-1"
                      : "text-muted-foreground"
                  )}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn("border-b pb-4 mb-8", className)}>
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "text-sm",
              item.level === 2 && "pl-0",
              item.level === 3 && "pl-4",
              item.level === 4 && "pl-8"
            )}
          >
            <button
              onClick={() => scrollToSection(item.id)}
              className="text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
